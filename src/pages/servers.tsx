import axios, { AxiosResponse } from "axios";
import { type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { CgWebsite } from "react-icons/cg";
import { FaDiscord } from "react-icons/fa";
import { FiHelpCircle } from "react-icons/fi";
import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  Flex,
  Heading,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { NavServerList } from "~/components/NavServerList";

interface guild {
  icon: string;
  id: string;
  name: string;
  permissions: string;
  link: string;
}

interface guildResponse {
  features: Array<string>;
  icon: string;
  id: string;
  name: string;
  owner: boolean;
  permissions: string;
}

const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_BACKOFF_DELAY = 1000;

const Home: NextPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: user, status } = useSession();
  const url = "https://discord.com/api/v9/users/@me/guilds";
  const [guildArray, setGuildArray] = useState<Array<guild>>([]);
  const [loading, setLoading] = useState(true);

  const getGuilds = async () => {
    let retryAttempts = 0;
    let backoffDelay = INITIAL_BACKOFF_DELAY;

    while (retryAttempts < MAX_RETRY_ATTEMPTS) {
      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${user?.user?.token}`,
          },
        });

        const data = response.data;
        const guilds: Array<guild> = [];
        data.forEach((a: guildResponse) => {
          if ((BigInt(a.permissions) & BigInt(1 << 5)) !== BigInt(0)) {
            guilds.push({
              id: a.id,
              name: a.name,
              permissions: a.permissions,
              icon: a.icon
                ? `https://cdn.discordapp.com/icons/${a.id}/${a.icon}.png`
                : "/DefaultIcon.png",
              link: `/servers/${a.id}`,
            });
          }
        });
        console.log(guilds[0]?.permissions);
        setGuildArray(guilds);
        setLoading(false);
        break;
      } catch (error: any) {
        if (error.response?.status === 429) {
          retryAttempts++;
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
          backoffDelay *= 2;
        } else {
          console.error("Error:", error.message);
          break;
        }
      }
    }

    if (retryAttempts === MAX_RETRY_ATTEMPTS) {
      console.error("Max retry attempts reached. Unable to get guilds.");
    }
  };

  useEffect(() => {
    if (status == "authenticated") {
      getGuilds();
    }
  }, [status]);

  if (status == "authenticated") {
    if (loading) {
      return (
        <>
          <NavServerList />
          <div
            style={{
              textAlign: "center",
              fontSize: "30px",
              paddingTop: "50px",
            }}
          >
            Loading...
          </div>
        </>
      );
    } else {
      return (
        <>
          <NavServerList />
          <Box
            maxW="3xl"
            mx="auto"
            mt={8}
            px={8}
            py={4}
            rounded="lg"
            shadow="lg"
          >
            <Flex align="center" justify="space-between" mb={8}>
              <Heading as="h1" size="lg">
                Resolv Dashboard
              </Heading>
              <Menu>
                <MenuButton
                  as={IconButton}
                  aria-label="Options"
                  icon={<FiHelpCircle />}
                  variant="outline"
                />
                <MenuList>
                  <MenuItem icon={<CgWebsite />}>Documentation</MenuItem>
                  <MenuItem icon={<FaDiscord />}>Support</MenuItem>
                </MenuList>
              </Menu>
            </Flex>
            <Flex justify="center">
              <SimpleGrid columns={[1, 2, 3]} spacing={10} spacingX={20}>
                {guildArray.map((server) => (
                  <Card
                    key={server.link}
                    p={10}
                    shadow="md"
                    rounded="md"
                    width="250px"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center"
                  >
                    <Link href={`${server.link}`}>
                      <Avatar src={server.icon} size="2xl" mb={4} />
                      <Heading as="h2" size="md">
                        {server.name}
                      </Heading>
                    </Link>
                  </Card>
                ))}
              </SimpleGrid>
            </Flex>
          </Box>
        </>
      );
    }
  } else {
    if (status == "unauthenticated") signIn("discord");

    return <p>Loading...</p>;
  }
};

export default Home;
