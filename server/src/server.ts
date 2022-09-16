import express, { json, response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { convertHourStringToMinutes } from './utils/convert-hour-string-to-minutes';
import { convertMinutesToHourString } from './utils/convert-minutes-to-hour-string';

const app = express();
app.use(express.json());
app.use(cors());
const prisma = new PrismaClient({
  log: ['query'],
});

app.get('/games', async (request, response) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,
        },
      },
    },
  });
  return response.json(games);
});

app.post('/games/:id/ads', async (request, response) => {
  const gameId = request.params.id;
  const body = request.body;

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      discord: body.discord,
      weeksDays: body.weeksDays.join(','),
      hourStart: convertHourStringToMinutes(body.hourStart).toString(),
      hourEnd: convertHourStringToMinutes(body.hourEnd).toString(),
      useVoiceChannel: body.useVoiceChannel,
    },
  });

  return response.status(201).json(ad);
});

app.get('/games/:id/ads', async (request, response) => {
  const gameId = request.params.id;
  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weeksDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
    },
    where: {
      gameId,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const result = ads.map((ad) => {
    return {
      ...ad,
      weeksDays: ad.weeksDays.split(','),
      hourStart: convertMinutesToHourString(Number(ad.hourStart)),
      hourEnd: convertMinutesToHourString(Number(ad.hourEnd)),
    };
  });

  return response.json(result);
});

app.get('/ads/:id/discord', async (request, response) => {
  const adId = request.params.id;
  const ad = await prisma.ad.findUnique({
    select: {
      discord: true,
    },
    where: {
      id: adId,
    },
  });
  console.log(ad);

  return response.json(ad);
});

app.listen(3333);
