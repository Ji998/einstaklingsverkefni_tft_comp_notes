import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { prisma } from "./lib/prisma";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
  })
);

app.get("/", (c) => {
  return c.text("TFT Notesis running");
});

app.get("/champions", async (c) => {
  try {
    const champions = await prisma.champion.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return c.json(champions);
  } catch (error) {
    console.error("Failed to fetch champions:", error);
    return c.json({ error: "Failed to fetch champions" }, 500);
  }
});

serve({
  fetch: app.fetch,
  port: 3000,
});

console.log("Backend running on http://localhost:3000");

app.get("/comps", async (c) => {
    try {
      const comps = await prisma.comp.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
  
      return c.json(comps);
    } catch (error) {
      console.error("Failed to fetch comps:", error);
      return c.json({ error: "Failed to fetch comps" }, 500);
    }
  });
  
  app.post("/comps", async (c) => {
    try {
      const body = await c.req.json();
      const title = body.title?.trim();
      const notes = body.notes?.trim() || null;
  
      if (!title) {
        return c.json({ error: "Title is required" }, 400);
      }
  
      const comp = await prisma.comp.create({
        data: {
          title,
          notes,
        },
      });
  
      return c.json(comp, 201);
    } catch (error) {
      console.error("Failed to create comp:", error);
      return c.json({ error: "Failed to create comp" }, 500);
    }
  });

  app.get("/comps/:id", async (c) => {
    try {
      const id = Number(c.req.param("id"));
  
      if (Number.isNaN(id)) {
        return c.json({ error: "Invalid comp id" }, 400);
      }
  
      const comp = await prisma.comp.findUnique({
        where: { id },
        include: {
          champions: {
            include: {
              champion: true,
            },
          },
        },
      });
  
      if (!comp) {
        return c.json({ error: "Comp not found" }, 404);
      }
  
      return c.json(comp);
    } catch (error) {
      console.error("Failed to fetch comp:", error);
      return c.json({ error: "Failed to fetch comp" }, 500);
    }
  });

  app.post("/comps/:id/champions", async (c) => {
    try {
      const compId = Number(c.req.param("id"));
      const body = await c.req.json();
  
      const championId = Number(body.championId);
      const isMainCarry = Boolean(body.isMainCarry);
      const itemNotes = body.itemNotes?.trim() || null;
  
      if (Number.isNaN(compId) || Number.isNaN(championId)) {
        return c.json({ error: "Invalid compId or championId" }, 400);
      }
  
      const comp = await prisma.comp.findUnique({
        where: { id: compId },
      });
  
      if (!comp) {
        return c.json({ error: "Comp not found" }, 404);
      }
  
      const champion = await prisma.champion.findUnique({
        where: { id: championId },
      });
  
      if (!champion) {
        return c.json({ error: "Champion not found" }, 404);
      }
  
      const compChampion = await prisma.compChampion.create({
        data: {
          compId,
          championId,
          isMainCarry,
          itemNotes,
        },
        include: {
          champion: true,
        },
      });
  
      return c.json(compChampion, 201);
    } catch (error) {
      console.error("Failed to add champion to comp:", error);
      return c.json({ error: "Failed to add champion to comp" }, 500);
    }
  });

  app.delete("/comps/:compId/champions/:entryId", async (c) => {
  try {
    const compId = Number(c.req.param("compId"));
    const entryId = Number(c.req.param("entryId"));

    if (Number.isNaN(compId) || Number.isNaN(entryId)) {
      return c.json({ error: "Invalid compId or entryId" }, 400);
    }

    const entry = await prisma.compChampion.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      return c.json({ error: "Comp champion entry not found" }, 404);
    }

    if (entry.compId !== compId) {
      return c.json({ error: "Entry does not belong to this comp" }, 400);
    }

    await prisma.compChampion.delete({
      where: { id: entryId },
    });

    return c.json({ message: "Champion removed from comp" });
  } catch (error) {
    console.error("Failed to delete champion from comp:", error);
    return c.json({ error: "Failed to delete champion from comp" }, 500);
  }
});

app.delete("/comps/:compId/champions/:entryId", async (c) => {
    try {
      const compId = Number(c.req.param("compId"));
      const entryId = Number(c.req.param("entryId"));
  
      if (Number.isNaN(compId) || Number.isNaN(entryId)) {
        return c.json({ error: "Invalid compId or entryId" }, 400);
      }
  
      const entry = await prisma.compChampion.findUnique({
        where: { id: entryId },
      });
  
      if (!entry) {
        return c.json({ error: "Comp champion entry not found" }, 404);
      }
  
      if (entry.compId !== compId) {
        return c.json({ error: "Entry does not belong to this comp" }, 400);
      }
  
      await prisma.compChampion.delete({
        where: { id: entryId },
      });
  
      return c.json({ message: "Champion removed from comp" });
    } catch (error) {
      console.error("Failed to delete champion from comp:", error);
      return c.json({ error: "Failed to delete champion from comp" }, 500);
    }
  });

  app.delete("/comps/:id", async (c) => {
    try {
      const id = Number(c.req.param("id"))
  
      if (Number.isNaN(id)) {
        return c.json({ error: "invalid comp id" }, 400)
      }
  
      const comp = await prisma.comp.findUnique({
        where: { id },
      })
  
      if (!comp) {
        return c.json({ error: "comp not found" }, 404)
      }
  
      await prisma.comp.delete({
        where: { id },
      })
  
      return c.json({ message: "comp deleted successfully" })
    } catch (error) {
      console.error("failed to delete comp:", error)
      return c.json({ error: "failed to delete comp" }, 500)
    }
  })