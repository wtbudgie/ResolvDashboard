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
        const guilds: Array<guild> = data.map((a: guildResponse) => ({
          id: a.id,
          name: a.name,
          permissions: a.permissions,
          icon: a.icon
            ? `https://cdn.discordapp.com/icons/${a.id}/${a.icon}.png`
            : "/DefaultIcon.png",
          link: `/servers/${a.id}`,
        }));
        setGuildArray(guilds);
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
    console.log(guildArray);
    return (
      <>
        <NavServerList />
        <Box maxW="3xl" mx="auto" mt={8} px={8} py={4} rounded="lg" shadow="lg">
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
          <Text mb={4}>Select an item</Text>
          <SimpleGrid columns={[1, 2, 3]} spacing={8}>
            {guildArray.map((server) => (
              <Card key={server.link} p={4} shadow="md" rounded="md">
                <Avatar src={server.icon} size="2xl" mb={4} />
                <Heading as="h2" size="md">
                  {server.name}
                </Heading>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      </>
    );
  } else {
    if (status == "unauthenticated") signIn("discord");

    return <p>Loading...</p>;
  }
};

export default Home;
