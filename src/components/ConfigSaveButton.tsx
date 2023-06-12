import { Button } from "@chakra-ui/react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Router, useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";
import { IConfig } from "~/models/GuildModel";

interface props {
  isSaved: boolean;
  setIsSaved: Dispatch<SetStateAction<boolean>>;
  isSaving: boolean;
  setIsSaving: Dispatch<SetStateAction<boolean>>;
  updatedValues: {};
  setUpdatedValues: Dispatch<SetStateAction<{}>>;
  setConfigData: Dispatch<SetStateAction<IConfig | undefined>>;
}

export const ConfigSaveButton = ({
  isSaved,
  setIsSaved,
  isSaving,
  setIsSaving,
  updatedValues,
  setUpdatedValues,
  setConfigData,
}: props) => {
  const router = useRouter();
  const session = useSession();

  const apiUrl = "http://localhost:3000/api";

  return (
    <>
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
              token: session.data?.user?.token,
              changes: updatedValues,
            }
          );
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
};
