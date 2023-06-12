import axios from "axios";
import { type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { CgWebsite } from "react-icons/cg";
import { FaDiscord } from "react-icons/fa";
import { FiHelpCircle } from "react-icons/fi";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { NavServerList } from "~/components/NavServerList";
import { channel } from "diagnostics_channel";
import { useRouter } from "next/router";
import Head from "next/head";
import { IConfig } from "~/models/GuildModel";

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

const ServerConfigEditorPage: NextPage = () => {
  const router = useRouter();
  const { data: user, status } = useSession();

  const [configData, setConfigData] = useState<IConfig>();
  const [channelArray, setChannelArray] = useState<Array<channel>>([]);
  const [categoryArray, setCategoryArray] = useState<Array<channel>>([]);
  const [roleArray, setRoleArray] = useState<Array<role>>([]);
  const [guildInfo, setGuildInfo] = useState<guild>({} as guild);
  const [loading, setLoading] = useState(true);
  const [updatedValues, setUpdatedValues] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [dataFetchSuccess, setDataFetchSuccess] = useState(true);

  const apiUrl = "http://localhost:3000/api";
  const id = router.query.guildId;

  const getServerInformation = async () => {
    try {
      const getConfig = await axios.get(
        `${apiUrl}/config/guild?token=${user?.user?.token}&id=${id}`
      );
      const getGuild = await axios.get(`${apiUrl}/guild/info?guildId=${id}`);
      const getChannel = await axios.get(
        `${apiUrl}/guild/channels?guildId=${id}`
      );

      const guildData = getGuild.data;

      const channelData = getChannel.data.filter((c: any) => c.type == 0);
      const categoryData = getChannel.data.filter((c: any) => c.type == 4);
      const roleData = guildData.roles.filter((r: any) => r.managed == false);

      if (getConfig.data.status == 404) {
        setDataFetchSuccess(false);
      }

      setGuildInfo(guildData);
      setCategoryArray(categoryData);
      setChannelArray(channelData);
      setRoleArray(roleData);
      setConfigData(getConfig.data);

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

  if (dataFetchSuccess == false) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Text
          color={"red.500"}
          fontWeight={"bold"}
          fontSize={"4xl"}
          textAlign={"center"}
        >
          Resolv has not been configured in your server yet.
        </Text>
        <Text textAlign={"center"} fontSize={"2xl"}>
          To use Resolv Dashboard, you are required to run a command before
          using the dashboard to prepare all config values.
        </Text>
        <Button
          colorScheme="green"
          size={"lg"}
          mt={4}
          pl={"70"}
          pr={"70"}
          pt={"9"}
          pb={"9"}
          fontSize={"2xl"}
          onClick={() => router.push("/servers")}
        >
          Go Back to Server Selector
        </Button>
      </div>
    );
  }

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
                {guildInfo.name}'s Server Dashboard
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
              <SimpleGrid>
                <Card
                  key="breakSystemConfig"
                  mt="10"
                  p={10}
                  shadow="md"
                  rounded="md"
                  width="1000px"
                  display="flex"
                  flexDirection="column"
                >
                  <Heading as="h2" size="md" mb="5" textAlign="left">
                    Break Config
                  </Heading>
                  <Text>Break Request Channel</Text>
                  <Select
                    disabled={isSaving}
                    key={"breakRequestChannelSelector"}
                    name="BreakAcceptOrDenyChannel"
                    defaultValue={
                      configData?.BreakAcceptOrDenyChannel?.split("-")[1]
                    }
                    onChange={(e) => {
                      const newValue = `${id}-${e.target.value}`;
                      setUpdatedValues((prevValues: any) => {
                        // @ts-ignore
                        if (prevValues.BreakAcceptOrDenyChannel !== newValue) {
                          return {
                            ...prevValues,
                            BreakAcceptOrDenyChannel: newValue,
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
                  <br />
                  <Text>Break Role</Text>
                  <Select
                    disabled={isSaving}
                    key={"breakRoleSelector"}
                    name="BreakRoleID"
                    defaultValue={configData?.BreakRoleID?.split("-")[1]}
                    onChange={(e) => {
                      const newValue = `${id}-${e.target.value}`;
                      setUpdatedValues((prevValues: any) => {
                        // @ts-ignore
                        if (prevValues.BreakRoleID !== newValue) {
                          return {
                            ...prevValues,
                            BreakRoleID: newValue,
                          };
                        }
                        return prevValues;
                      });
                    }}
                  >
                    {roleArray.map((role: role) => (
                      <option
                        key={role.id}
                        id={role.id + "-" + role.name}
                        value={role.id}
                      >
                        {role.name}
                      </option>
                    ))}
                  </Select>
                </Card>
                <Card
                  key="threadConfigConfig"
                  mt="10"
                  p={10}
                  shadow="md"
                  rounded="md"
                  width="1000px"
                  display="flex"
                  flexDirection="column"
                >
                  <Heading as="h2" size="md" mb="5" textAlign="left">
                    Thread System
                  </Heading>
                  <Text>Thread Category Channel</Text>
                  <Select
                    disabled={isSaving}
                    key={"threadCategorySelector"}
                    name="ContactCategoryID"
                    defaultValue={configData?.ContactCategoryID?.split("-")[1]}
                    onChange={(e) => {
                      const newValue = `${id}-${e.target.value}`;
                      setUpdatedValues((prevValues: any) => {
                        // @ts-ignore
                        if (prevValues.ContactCategoryID !== newValue) {
                          return {
                            ...prevValues,
                            ContactCategoryID: newValue,
                          };
                        }
                        return prevValues;
                      });
                    }}
                  >
                    {categoryArray.map((channel: channel) => (
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
            disabled={!isSaved}
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
            onClick={async () => {
              if (Object.keys(updatedValues).length > 0) {
                setUpdatedValues({});
              }
              setIsSaving(true);
              setIsSaved(false);

              const setConfig = await axios.post(
                `${apiUrl}/config/set?id=${router.query.guildId}`,
                {
                  token: user?.user?.token,
                  changes: updatedValues,
                }
              );
              console.log(setConfig.data);
              if (setConfig.data.success == true) {
                setIsSaving(false);
                setIsSaved(true);
                setConfigData(setConfig.data.newConfig);
              } else {
                console.error("Error saving data");
                setIsSaving(false);
                setIsSaved(false);
              }

              setTimeout(() => {
                setIsSaved(false);
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

export default ServerConfigEditorPage;
