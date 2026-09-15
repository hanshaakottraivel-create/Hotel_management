import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", hasAiKey: Boolean(process.env.GEMINI_API_KEY) });
  });

  // AI Assistant Chat Endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, history = [], context = {} } = req.body;
      const ai = getGeminiClient();

      const systemPrompt = `You are "Aura", the elite AI Executive Assistant for Grand Horizon Hotel Management.
You have access to current hotel real-time metrics and state:
- Total Rooms: ${context.totalRooms || 24}
- Occupancy: ${context.occupancyRate || "83%"}
- Active Guests: ${context.activeGuests || 38}
- Today's Arrivals: ${context.todayArrivals || 6}
- Today's Departures: ${context.todayDepartures || 4}
- Pending Housekeeping Tasks: ${context.pendingTasks || 5}
- Today's Revenue: $${context.todayRevenue || "14,850"}

Your duties:
1. Assist front desk, operations, and general management with room allocations, VIP guest handling, housekeeping dispatch, booking adjustments, and rate strategy.
2. Provide concise, professional, highly actionable guidance in polite hospitality tone.
3. If asked to perform an action (e.g. prioritize tasks, organize rooms, suggest pricing), structure your recommendation with bullet points, rationale, and specific room numbers or staff assignments.
4. Keep replies clear, well-structured, and directly useful for hotel staff.`;

      if (!ai) {
        // Fallback intelligent responder if API key is not yet configured
        let reply = "I am ready to assist with hotel operations. ";
        const lower = (message || "").toLowerCase();
        if (lower.includes("brief") || lower.includes("summary") || lower.includes("status")) {
          reply += `Current Hotel Status: Occupancy is at ${context.occupancyRate || "83%"}, with ${context.todayArrivals || 6} arrivals scheduled today and ${context.pendingTasks || 5} pending housekeeping work orders. VIP guests are arriving in Rooms 401 & Penthouse 502. Recommended priority: Fast-track Room 304 turnover before 14:00 check-in.`;
        } else if (lower.includes("task") || lower.includes("housekeeping") || lower.includes("priority")) {
          reply += `Housekeeping Task Optimization:
1. Room 304 (Deluxe King) - Priority High: Arrival in 2 hours (Mr. Henderson). Assigned to Maria Santos.
2. Room 208 (Executive Suite) - Priority High: VIP Platinum early check-in.
3. Penthouse 501 - Routine turnover: Due by 16:00.
Recommend shifting 1 evening staff to 3rd floor turnover.`;
        } else if (lower.includes("room") || lower.includes("assign") || lower.includes("book")) {
          reply += `Room Management Insight: Floor 3 is at 90% occupancy. For incoming VIP guests, Ocean View Suites 401 and 402 offer prime quiet corners. Consider a complimentary upgrade for Gold member Ms. Vance to optimize Standard Queen inventory.`;
        } else {
          reply += `I have reviewed the hotel registry. Today we have ${context.todayArrivals || 6} check-ins pending and $${context.todayRevenue || "14,850"} in captured revenue. How can I assist with bookings, staff routing, or guest requests?`;
        }
        return res.json({ reply, source: "mock" });
      }

      const contents = [
        ...history.slice(-6).map((msg: { role: string; content: string }) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })),
        {
          role: "user",
          parts: [{ text: message }],
        },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      res.json({ reply: response.text, source: "gemini" });
    } catch (err: any) {
      console.error("Gemini chat error:", err);
      res.status(500).json({
        error: "Failed to generate AI response",
        details: err?.message || String(err),
      });
    }
  });

  // Daily Activity Summary & Intelligence Briefing
  app.post("/api/ai/briefing", async (req, res) => {
    try {
      const { hotelState } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          summary: `### 🌅 Morning Executive Hotel Briefing

**Occupancy & Revenue:**
- Current Occupancy: **${hotelState?.occupancyRate || "84%"}** (Target: 80%+)
- Today's Forecast Revenue: **$${hotelState?.todayRevenue || "14,850"}** (ADR: $215)

**Front Desk & Guest Operations:**
- **${hotelState?.todayArrivals || 6} Check-ins** scheduled between 14:00 and 19:00.
- **${hotelState?.todayDepartures || 4} Check-outs** completed or in progress.
- 2 VIP guests arriving: Platinum member *Eleanor Vance* (Suite 401) and Corporate account *Dr. Julian Hayes* (Suite 302).

**Housekeeping & Maintenance Focus:**
- Fast-track turnover on Rooms **204** & **304** for incoming early arrivals.
- Maintenance ticket #104 (AC filter in 202) marked as urgent before 15:00.

**Revenue Optimization Tip:**
- Only 3 Deluxe King rooms remain for the weekend. Recommend raising bar rate by +12% on direct channels.`,
          source: "fallback",
        });
      }

      const prompt = `Generate an executive daily operational briefing for the Hotel General Manager and Front Desk team.
Current data:
${JSON.stringify(hotelState, null, 2)}

Provide:
1. Executive Performance Snapshot (Occupancy, Revenue, Key Health)
2. Critical Operations & Arrivals (VIP guests, specific room preparation)
3. Housekeeping & Maintenance Priority Allocation
4. Revenue & Upselling Action Points for the Front Desk team today.
Use professional markdown with bolding, bullet points, and high readability.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      res.json({ summary: response.text, source: "gemini" });
    } catch (err: any) {
      console.error("Gemini briefing error:", err);
      res.status(500).json({ error: "Failed to create briefing" });
    }
  });

  // Prioritize Tasks using AI
  app.post("/api/ai/prioritize-tasks", async (req, res) => {
    try {
      const { tasks, rooms, checkInsToday } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // Deterministic intelligent prioritization fallback
        const prioritized = (tasks || []).map((t: any, index: number) => {
          let score = 50;
          let rationale = "Routine operational task.";
          if (t.priority === "Urgent") {
            score = 95;
            rationale = "Marked urgent by front desk due to immediate guest requirement.";
          } else if (t.category === "Housekeeping" && t.roomNumber) {
            score = 85;
            rationale = `Turnover needed for upcoming check-in on Room ${t.roomNumber}.`;
          } else if (t.category === "Maintenance") {
            score = 75;
            rationale = "Equipment resolution to prevent room out-of-order status.";
          }
          return {
            ...t,
            aiPriorityScore: score - index,
            aiRationale: rationale,
          };
        }).sort((a: any, b: any) => b.aiPriorityScore - a.aiPriorityScore);

        return res.json({
          tasks: prioritized,
          advice: "Tasks re-ordered prioritizing incoming check-ins and urgent guest repair orders.",
          source: "fallback",
        });
      }

      const prompt = `You are an AI Hotel Operations Dispatcher. Analyze these hotel work orders / tasks and order them from highest to lowest urgency.
Tasks list:
${JSON.stringify(tasks, null, 2)}

Upcoming Check-ins & Context:
${JSON.stringify({ rooms, checkInsToday }, null, 2)}

Return a valid JSON response with this exact structure:
{
  "tasks": [
    {
      "id": "task-id",
      "aiPriorityScore": 95,
      "aiRationale": "Why this is high or low priority based on hotel guest arrival and safety"
    }
  ],
  "advice": "1-2 sentences of operational dispatch guidance for the shift manager"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("Task prioritization error:", err);
      res.status(500).json({ error: "Failed to prioritize tasks" });
    }
  });

  // Draft Guest Communication
  app.post("/api/ai/draft-message", async (req, res) => {
    try {
      const { guestName, roomNumber, messageType, specialRequests, reservationId } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        let content = "";
        if (messageType === "welcome") {
          content = `Dear ${guestName},\n\nWelcome to Grand Horizon Hotel! We are delighted to host your stay in Room ${roomNumber}.\n\nYour room has been prepared to perfection. ${specialRequests ? `Regarding your request (${specialRequests}), our concierge has attended to every detail.` : ""}\n\nOur concierge desk is available 24/7 by dialing '0'. We wish you a peaceful and luxurious stay.\n\nWarm regards,\nThe Grand Horizon Management Team`;
        } else if (messageType === "checkout") {
          content = `Dear ${guestName},\n\nThank you for choosing Grand Horizon Hotel for your recent visit (Folio #${reservationId || "RES-8921"}). It was an absolute pleasure hosting you in Room ${roomNumber}.\n\nYour finalized invoice has been attached. We hope you enjoyed your time with us, and we look forward to welcoming you back on your next trip.\n\nSafe travels,\nGuest Relations Team`;
        } else {
          content = `Dear ${guestName},\n\nThank you for contacting Grand Horizon Hotel. We have updated your reservation preferences for Room ${roomNumber}. Please let us know if there is anything else we can arrange prior to your arrival.\n\nWarm regards,\nFront Desk Operations`;
        }
        return res.json({ message: content, source: "fallback" });
      }

      const prompt = `Draft a luxury hotel communication for a guest.
Guest Name: ${guestName}
Room: ${roomNumber}
Type: ${messageType} (e.g. welcome, checkout, special-request, apology)
Special Requests: ${specialRequests || "None"}
Reservation: ${reservationId || "RES-8921"}

Keep the tone warm, refined, hospitable, and concise.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      res.json({ message: response.text, source: "gemini" });
    } catch (err: any) {
      console.error("Draft message error:", err);
      res.status(500).json({ error: "Failed to draft message" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
