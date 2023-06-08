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
  Button,
  Card,
  Flex,
  Heading,
  IconButton,
  Input,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  SimpleGrid,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { NavServerList } from "~/components/NavServerList";
import { channel } from "diagnostics_channel";
import { useRouter } from "next/router";
import Head from "next/head";

interface channel {
  id: string;
  name: string;
}

interface role {
  id: string;
  name: string;
  permissions: string;
  position: number;
  color: number;
  hoist: boolean;
  managed: boolean;
  mentionable: boolean;
}

interface guild {
  id: string;
  name: string;
  icon: string;
  owner_id: string;
  roles: Array<role>;
  nsfw: boolean;
}

const Home: NextPage = () => {
  const router = useRouter();
  const { data: user, status } = useSession();

  const [channelArray, setChannelArray] = useState<Array<channel>>([]);
  const [roleArray, setRoleArray] = useState<Array<role>>([]);
  const [guildInfo, setGuildInfo] = useState<guild>({} as guild);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [updatedValues, setUpdatedValues] = useState({});
  const [isSaved, setIsSaved] = useState(false);

  const getServerInformation = async () => {
    try {
      const id = router.query.guildId;
      const apiUrl = "http://localhost:3000/api";
      const getGuild = await axios.get(`${apiUrl}/guild/info?guildId=${id}`);

      const getChannel = await axios.get(
        `${apiUrl}/guild/channels?guildId=${id}`
      );

      const guildData = getGuild.data;

      const channelData = getChannel.data.filter((c: any) => c.type == 0);
      console.log(channelData);

      setGuildInfo(guildData);
      setChannelArray(channelData);
      setRoleArray(guildData.roles);

      setLoading(false);
    } catch (error: any) {
      console.error("Error:", error.message);
    }
  };

  useEffect(() => {
    if (status == "authenticated") {
      getServerInformation();
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
          <Head>
            <title>{guildInfo.name}</title>
          </Head>
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
              <SimpleGrid columns={[1]} spacing={10} spacingX={20}>
                <Card
                  key="breakRequestChannel"
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
                  <Heading as="h2" size="md">
                    Break Request Channel
                  </Heading>
                  <Select
                    disabled={isSaving}
                    key={"breakRequestChannelSelector"}
                    name="breakRequestChannel"
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setUpdatedValues((prevValues) => {
                        // @ts-ignore
                        if (prevValues.breakRequestChannel !== newValue) {
                          return {
                            ...prevValues,
                            breakRequestChannel: newValue,
                          };
                        }
                        return prevValues;
                      });
                    }}
                  >
                    {channelArray.map((channel: channel) => (
                      <option
                        key={channel.id}
                        id={channel.id}
                        value={channel.id}
                      >
                        {channel.name}
                      </option>
                    ))}
                  </Select>
                </Card>
              </SimpleGrid>
            </Flex>
          </Box>
          <Button
            type="button"
            colorScheme="blue"
            loadingText="Saving..."
            isLoading={isSaving}
            disabled={isSaved}
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              transition: ".5s",
            }}
            size={"lg"}
            fontSize={"2xl"}
            padding={"20px 30px"}
            pointerEvents={isSaved ? "none" : "auto"}
            onClick={() => {
              if (Object.keys(updatedValues).length > 0) {
                setUpdatedValues({});
                console.log(updatedValues);
              }
              setIsSaving(true);
              setTimeout(() => {
                setIsSaving(false);
                setIsSaved(true);
                setTimeout(() => {
                  setIsSaved(false);
                }, 3000);
              }, 3000);
            }}
          >
            {isSaved ? "Saved" : isSaving ? "Saving..." : "Save"}
          </Button>
        </>
      );
    }
  } else {
    if (status == "unauthenticated") signIn("discord");

    return <p>Loading...</p>;
  }
};

export default Home;
