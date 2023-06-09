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
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { NavServerList } from "~/components/NavServerList";
import { channel } from "diagnostics_channel";
import { useRouter } from "next/router";
import Head from "next/head";
import { IConfig } from "~/models/GuildModel";
import { ConfigSelector } from "~/components/ConfigSelector";
import { ConfigSaveButton } from "~/components/ConfigSaveButton";

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
  const [configValueFetchSuccess, setConfigValueFetchSuccess] = useState(true);

  const apiUrl = "http://localhost:3000/api";
  const id = router.query.guildId;

  const getServerInformation = async () => {
    try {
      const getConfig = await axios.get(
        `${apiUrl}/config/guild?token=${user?.user?.token}&id=${id}`
      );
      if (getConfig.status !== 200) {
        setConfigValueFetchSuccess(false);
      }

      const getGuild = await axios.get(`${apiUrl}/guild/info?guildId=${id}`);
      if (getGuild.status !== 200) {
        setDataFetchSuccess(false);
      }

      const getChannel = await axios.get(
        `${apiUrl}/guild/channels?guildId=${id}`
      );
      if (getChannel.status !== 200) {
        setDataFetchSuccess(false);
      }

      const guildData = getGuild.data;

      const channelData = getChannel.data.filter((c: any) => c.type == 0);
      const categoryData = getChannel.data.filter((c: any) => c.type == 4);
      const roleData = guildData.roles.filter((r: any) => r.managed == false);

      setGuildInfo(guildData);
      setCategoryArray(categoryData);
      setChannelArray(channelData);
      setRoleArray(roleData);
      setConfigData(getConfig.data);

      setLoading(false);
    } catch (error: any) {
      console.error("Error occured: " + error);
      router.reload();
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    getServerInformation();
  }, [status]);

  if (configValueFetchSuccess == false) {
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

  if (status !== "authenticated") {
    if (status == "unauthenticated") signIn("discord");
    return <p>Loading...</p>;
  }

  return (
    <>
      <Head>
        <title>{guildInfo.name}</title>
      </Head>
      <NavServerList />
      <Box maxW="3xl" mx="auto" mt={8} px={8} py={4} rounded="lg" shadow="lg">
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
              <ConfigSelector
                configValue="BreakAcceptOrDenyChannel"
                displayName="Break Request Channel"
                isSaving={isSaving}
                defaultValue={
                  configData?.BreakAcceptOrDenyChannel?.split("-")[1] as string
                }
                optionArray={channelArray as [channel]}
                id={id as string}
                setUpdatedValues={setUpdatedValues}
              />
              <br />
              <ConfigSelector
                configValue="BreakRoleID"
                displayName="Break Role"
                isSaving={isSaving}
                defaultValue={configData?.BreakRoleID?.split("-")[1] as string}
                optionArray={roleArray as [role]}
                id={id as string}
                setUpdatedValues={setUpdatedValues}
              />
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
              <ConfigSelector
                configValue="ContactCategoryID"
                displayName="Thread Category Channel"
                isSaving={isSaving}
                defaultValue={
                  configData?.ContactCategoryID?.split("-")[1] as string
                }
                optionArray={categoryArray as [channel]}
                id={id as string}
                setUpdatedValues={setUpdatedValues}
              />
            </Card>
          </SimpleGrid>

          <ConfigSaveButton
            isSaved={isSaved}
            setIsSaved={setIsSaved}
            isSaving={isSaving}
            setIsSaving={setIsSaving}
            updatedValues={updatedValues}
            setUpdatedValues={setUpdatedValues}
            setConfigData={setConfigData}
          />
        </Flex>
      </Box>
    </>
  );
};

export default ServerConfigEditorPage;
