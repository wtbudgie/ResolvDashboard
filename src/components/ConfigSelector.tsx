import { Select, Text } from "@chakra-ui/react";
import { Dispatch, SetStateAction } from "react";

interface props {
  configValue: string;
  displayName: string;
  isSaving: boolean;
  defaultValue: string;
  optionArray: [item];
  id: string;
  setUpdatedValues: Dispatch<SetStateAction<{}>>;
}

interface item {
  id: string;
  name: string;
}

export const ConfigSelector = ({
  configValue,
  displayName,
  isSaving,
  defaultValue,
  id,
  setUpdatedValues,
  optionArray,
}: props) => {
  return (
    <>
      <Text>{displayName}</Text>
      <Select
        disabled={isSaving}
        key={configValue}
        name={configValue}
        defaultValue={defaultValue}
        onChange={(e) => {
          const newValue = `${id}-${e.target.value}`;
          setUpdatedValues((prevValues: any) => {
            // @ts-ignore
            if (prevValues[configValue] !== newValue) {
              return {
                ...prevValues,
                [configValue]: newValue,
              };
            }
            return prevValues;
          });
        }}
      >
        {optionArray.map((i: item) => (
          <option key={i.id} id={i.id} value={i.id}>
            {i.name}
          </option>
        ))}
      </Select>
    </>
  );
};
