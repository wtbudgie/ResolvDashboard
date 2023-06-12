import axios, { AxiosResponse } from "axios";
import { HydratedDocument } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "~/db";
import configModel, { IConfig } from "~/models/GuildModel";

// example request: /config/set?id=123
const SetConfig = async (req: NextApiRequest, res: NextApiResponse) => {
  const guildId = req.query.id;
  const changes = req.body.changes;
  const token = req.body.token;

  if (!guildId && !changes && !token) {
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
    if ((BigInt(guild.permissions) & BigInt(1 << 5)) == BigInt(0)) {
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

    Object.keys(changes).forEach((change: string) => {
      // @ts-ignore
      guildModel[change] = `${changes[change]}`;
    });

    guildModel.save();
    res.json({ success: true, newConfig: guildModel });
  } catch (error: any) {
    console.error("Error:", error.message);
    return res.json({
      status: 500,
      message: "An internal server error occurred.",
    });
  }
};

export default SetConfig;
