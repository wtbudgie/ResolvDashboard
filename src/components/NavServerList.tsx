import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  Stack,
  useColorMode,
  Center,
  Text,
  Link,
} from "@chakra-ui/react";
import { AppLogo } from "../components/AppLogo";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export const NavServerList = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <>
      <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <AppLogo />
          <Flex alignItems={"center"}>
            <Stack direction={"row"} spacing={7}>
              <Button onClick={toggleColorMode}>
                {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              </Button>
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={"full"}
                  variant={"link"}
                  cursor={"pointer"}
                  minW={0}
                >
                  <Avatar
                    size={"sm"}
                    src={
                      session?.user?.image
                        ? `${session?.user.image}`
                        : "/DefaultIcon.png"
                    }
                  />
                </MenuButton>
                <MenuList alignItems={"center"}>
                  <br />
                  <Center>
                    <Avatar
                      size={"2xl"}
                      src={
                        session?.user?.image
                          ? `${session?.user.image}`
                          : "/DefaultIcon.png"
                      }
                    />
                  </Center>
                  <br />
                  <Center>
                    <Text fontSize={"3xl"}>{session?.user.name}</Text>
                  </Center>
                  <MenuDivider />
                  <MenuItem>
                    <Link href="/servers">Your Servers</Link>
                  </MenuItem>
                  <MenuItem>
                    <Link href="/settings">Account Settings</Link>
                  </MenuItem>
                  <MenuItem
                    onClick={async () => {
                      const data = await signOut({
                        redirect: true,
                        callbackUrl: "https://resolvbot.xyz/",
                      });
                      router.push("https://resolvbot.xyz/");
                    }}
                  >
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  );
};
