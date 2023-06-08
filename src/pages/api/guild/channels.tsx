import axios, { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

// example request: /user/guilds?guildId=123
const Home = async (req: NextApiRequest, res: NextApiResponse) => {
  const guildId = req.query.guildId;
  if (!guildId) return res.json("No guild ID provided");

  const url = `https://discord.com/api/v9/guilds/${guildId}/channels`;
  const token = process.env.DISCORD_TOKEN;

  try {
    const response: AxiosResponse = await axios.get(url, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    });

    const data = response.data;
    res.json(data);
  } catch (error: any) {
    console.error("Error:", error.message);
    res.status(500).json("An error occurred");
  }
};

export default Home;
