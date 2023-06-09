import { Button, Text } from "@chakra-ui/react";
import styles from "./index.module.css";
import { GetServerSideProps, type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";

const Home: NextPage = () => {
  const router = useRouter();
  const session = useSession();

  if (session.status == "authenticated") {
    return (
      <>
        <Head>
          <title>Loading...</title>
          <meta name="description" content="Generated by create-t3-app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={styles.main}>
          <Link href={"/servers"}>Click here to view servers</Link>
          <Button
            type="button"
            colorScheme="blue"
            onClick={() => {
              signOut({ redirect: true, callbackUrl: "/" });
            }}
          >
            Signout
          </Button>
        </main>
      </>
    );
  } else {
    return (
      <>
        <Head>
          <title>Loading...</title>
          <meta name="description" content="Generated by create-t3-app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={styles.main}>
          <Button
            type="button"
            colorScheme="blue"
            onClick={() => {
              signIn("discord");
            }}
          >
            Click here to sign in!
          </Button>
        </main>
      </>
    );
  }
};

export default Home;
