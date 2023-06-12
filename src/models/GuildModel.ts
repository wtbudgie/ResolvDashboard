import { model, Schema, Document, models } from "mongoose";

export interface IConfig extends Document {
  GuildID: string;
  BreakAcceptOrDenyChannel: string;
  ContactCategoryID: string;
  BreakRoleID: string;
  HRRoleID: string[];
  StaffRoleID: string[];
  AutoEndBreak: boolean;

  RemoveStaffRoles: boolean;
  StaffRoleIDs: string[];

  Premium: boolean;

  ApplicationSystem: {
    Enabled: boolean;
    GuildID: string;
    ChannelID: string;
    RoleID: string;
    Types: string[];
    Message: string;
  };

  PromotionSystem: {
    Enabled: boolean;
    RoleIDs: string[];
  };
}

const configSchema = new Schema<IConfig>({
  GuildID: { type: String, required: true },
  BreakAcceptOrDenyChannel: { type: String, required: false },
  ContactCategoryID: { type: String, required: false },
  BreakRoleID: { type: String, required: false },
  HRRoleID: { type: [String], default: [] },
  StaffRoleID: { type: [String], default: [] },
  AutoEndBreak: { type: Boolean, default: false },

  RemoveStaffRoles: { type: Boolean, default: false },
  StaffRoleIDs: { type: [String], default: [] },

  Premium: { type: Boolean, default: false },

  ApplicationSystem: {
    Enabled: { type: Boolean, default: false },
    GuildID: { type: String, required: false },
    ChannelID: { type: String, required: false },
    RoleID: { type: String, required: false },
    Types: { type: [String], default: [] },
    Message: { type: String, required: false },
  },

  PromotionSystem: {
    Enabled: { type: Boolean, default: false },
    RoleIDs: { type: [String], default: [] },
  },
});

const ConfigModel = models.Config || model<IConfig>("Config", configSchema);

export default ConfigModel;
