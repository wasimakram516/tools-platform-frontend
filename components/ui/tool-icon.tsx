import AbcIcon from "@mui/icons-material/Abc";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import CasinoIcon from "@mui/icons-material/Casino";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import DateRangeIcon from "@mui/icons-material/DateRange";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CalculateIcon from "@mui/icons-material/Calculate";
import CompressIcon from "@mui/icons-material/Compress";
import DataObjectIcon from "@mui/icons-material/DataObject";
import EventIcon from "@mui/icons-material/Event";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import FormatSizeIcon from "@mui/icons-material/FormatSize";
import ImageIcon from "@mui/icons-material/Image";
import MonitorWeightOutlinedIcon from "@mui/icons-material/MonitorWeightOutlined";
import NotesIcon from "@mui/icons-material/Notes";
import PercentIcon from "@mui/icons-material/Percent";
import KeyIcon from "@mui/icons-material/Key";
import LinkIcon from "@mui/icons-material/Link";
import PasswordIcon from "@mui/icons-material/Password";
import PhotoSizeSelectLargeIcon from "@mui/icons-material/PhotoSizeSelectLarge";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import TagIcon from "@mui/icons-material/Tag";
import TerminalIcon from "@mui/icons-material/Terminal";
import TitleIcon from "@mui/icons-material/Title";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import TransformIcon from "@mui/icons-material/Transform";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import UpdateIcon from "@mui/icons-material/Update";
import WebIcon from "@mui/icons-material/Web";
import type { SvgIconProps } from "@mui/material";
import type { ComponentType, ReactNode } from "react";

/**
 * Every icon a registry entry may reference. Adding a key here makes it available everywhere.
 */
const TOOL_ICONS = {
  developer: TerminalIcon,
  image: ImageIcon,
  text: TextFieldsIcon,
  calculator: CalculateIcon,
  datetime: EventIcon,
  generator: AutoFixHighIcon,
  seo: TravelExploreIcon,
  data: TransformIcon,
  json: DataObjectIcon,
  base64: AbcIcon,
  url: LinkIcon,
  uuid: TagIcon,
  jwt: KeyIcon,
  hash: FingerprintIcon,
  age: CakeOutlinedIcon,
  dateDifference: DateRangeIcon,
  dateMath: EventRepeatIcon,
  hoursWorked: ScheduleIcon,
  timestamp: UpdateIcon,
  spreadsheet: TableChartOutlinedIcon,
  wordCount: NotesIcon,
  characterCount: FormatSizeIcon,
  caseConverter: TitleIcon,
  sortLines: SortByAlphaIcon,
  duplicateLines: PlaylistRemoveIcon,
  imageCompress: CompressIcon,
  imageResize: PhotoSizeSelectLargeIcon,
  favicon: WebIcon,
  password: PasswordIcon,
  qrCode: QrCode2Icon,
  random: CasinoIcon,
  percentage: PercentIcon,
  loan: AccountBalanceOutlinedIcon,
  interest: SavingsOutlinedIcon,
  bmi: MonitorWeightOutlinedIcon,
  tip: ReceiptLongOutlinedIcon,
} as const satisfies Record<string, ComponentType<SvgIconProps>>;

export type IconKey = keyof typeof TOOL_ICONS;

interface ToolIconProps extends SvgIconProps {
  name: IconKey;
}

/**
 * Resolves a registry icon key to its Material UI icon.
 */
export function ToolIcon({ name, ...iconProps }: ToolIconProps): ReactNode {
  const Icon = TOOL_ICONS[name];

  return <Icon aria-hidden="true" {...iconProps} />;
}
