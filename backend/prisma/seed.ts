import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "",
});

const prisma = new PrismaClient({ adapter });

async function main() {
    await prisma.compChampion.deleteMany();
    await prisma.comp.deleteMany();
    await prisma.champion.deleteMany();
    await prisma.champion.createMany({
        data: [
          { name: "Aatrox", traits: "Bastion, N.O.V.A" , price:1},
          { name: "Briar", traits: "Primordian, Rogue, Anima" , price:1},
          { name: "Caitlyn", traits: "Fateweaver, N.O.V.A", price:1 },
          { name: "Ezreal", traits: "Sniper, Timebreaker" , price:1},
          { name: "Leona", traits: "Arbiter, Vanguard", price:1 },
          { name: "Cho'Gath", traits: "Brawler, Dark Star" , price:1},
          {name:"Akali ",traits:"Marauder,N.O.V.A",price:2},
          {name:"Bel’Veth",traits:"Challenger,Marauder,Primordian",price:2},
          {name:"Gnar",traits:"Sniper,Meeple",price:2},
          {name:"Gragas",traits:"Brawler,Psionic",price:2},
          {name:"Gwen",traits:"Space Groove , Rogue",price:2},
          {name:"Meepsie",traits:"Voyager, Meeple,Shepherd",price:2},
          {name:"Aurora",traits:"Voyager,Anima",price:3},
          {name:"Diana",traits:"Arrbiter,Challenger",price:3},
          {name:"Fizz",traits:"Rogue,Meeple",price:3},
          {name:"Illaoi",traits:"Vanguard,Anima,Shepherd",price:3},
          {name:"Kai’Sa",traits:"Dark Star,Rogue",price:3},
          {name:"Lulu",traits:"Replicator,Stargazer",price:3},
          {name:"Aurelion Sol",traits:"Conduit,Mecha",price:4},
          {name:"Corki",traits:"FateWeaver,Meeple",price:4},
          {name:"Karma",traits:"",price:4},
          {name:"Karma",traits:"Dark Star,Voyager",price:4},
          {name:"Kindred",traits:"Challenger,N.O.V.A.",price:4},
          {name:"LeBlanc",traits:"Arbiter,Shepherd",price:4},
          {name:"Bard",traits:"Meeple,Conduit",price:5},
          {name:"Blitzcrank",traits:"Space Groove,Vanguard,Party Animal",price:5},
          {name:"Fiora",traits:"Anima,Marauder,Divine Duelist",price:5},
          {name:"Graves",traits:"Factory New",price:5},
          {name:"Jhin",traits:"Dark Star,Sniper,Eradicator",price:5},
          {name:"Morgana",traits:"Dark Lady",price:5}
,
]
      });
    }

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed.");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });