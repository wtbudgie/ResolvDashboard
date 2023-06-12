import axios, { AxiosResponse } from "axios";
import { HydratedDocument } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "~/db";
import configModel, { IConfig } from "~/models/GuildModel";

// example request: /config/guild?token=123&id=123
const Home = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.query.token;
  const guildId = req.query.id;
  if (!token || !guildId) {
    return res.json({ status: 400, message: "Bad request." });
  }

  try {
    const url = "https://discord.com/api/v9/users/@me/guilds";
    const response: AxiosResponse = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const guild = response.data.find((r: any) => r.id === guildId);
    if (!guild || (BigInt(guild.permissions) & BigInt(1 << 5)) === BigInt(0)) {
      return res.json({ status: 403, message: "Forbidden." });
    }

    await dbConnect();

    const guildModel: HydratedDocument<IConfig> | null =
      // @ts-ignore
      await configModel.findOne({
        GuildID: guildId,
      });
    if (!guildModel) {
      return res.json({
        status: 404,
        message: "Guild could not be found in config.",
      });
    }

    res.json(guildModel);
  } catch (error: any) {
    console.error("Error:", error.message);
    return res.json({
      status: 500,
      message: "An internal server error occurred.",
    });
  }
};

export default Home;
