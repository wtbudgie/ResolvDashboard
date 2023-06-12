import axios, { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

// example request: /user/guilds?guildId=123
const GetGuildInfo = async (req: NextApiRequest, res: NextApiResponse) => {
  const guildId = req.query.guildId;
  if (!guildId) return res.json("No guild ID provided");

  const url = `https://discord.com/api/v9/guilds/${guildId}`;
  const token = process.env.DISCORD_TOKEN;

  try {
    const response: AxiosResponse = await axios.get(url, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    });

    const data = response.data;
    const newGuildObject = {
      id: data.id,
      name: data.name,
      icon: data.icon
        ? `https://cdn.discordapp.com/icons/${data.id}/${data.icon}.png`
        : "/DefaultIcon.png",
      owner_id: data.owner_id,
      roles: data.roles,
      nsfw: data.nsfw,
    };

    res.json(newGuildObject);
  } catch (error: any) {
    console.error("Error:", error.message);
    res.status(500).json("An error occurred");
  }
};

export default GetGuildInfo;
