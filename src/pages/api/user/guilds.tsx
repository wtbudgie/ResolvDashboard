import axios, { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

// example request: /user/guilds?token=abc
const Home = async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = req.query.token;
  const url = "https://discord.com/api/v9/users/@me/guilds";

  const response: AxiosResponse = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = response.data();
  console.log(data);
  res.send("test");
};

export default Home;
