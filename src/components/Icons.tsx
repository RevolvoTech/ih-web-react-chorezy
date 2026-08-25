import {
  ArrowRightIcon,
  CheckIcon,
  EnvelopeSimpleIcon,
  HandCoinsIcon,
  HouseLineIcon,
  ListIcon,
  LinkSimpleIcon,
  MapPinIcon,
  ShieldCheckIcon,
  SparkleIcon,
  StorefrontIcon,
  UsersThreeIcon,
  XIcon,
} from "@phosphor-icons/react/ssr";

type IconName = "check" | "shield" | "pin" | "spark" | "arrow" | "menu" | "close" | "house" | "earn" | "family" | "store" | "mail" | "link";

type IconProps = {
  name: IconName;
  size?: number;
};

const icons = {
  check: CheckIcon,
  shield: ShieldCheckIcon,
  pin: MapPinIcon,
  spark: SparkleIcon,
  arrow: ArrowRightIcon,
  menu: ListIcon,
  close: XIcon,
  house: HouseLineIcon,
  earn: HandCoinsIcon,
  family: UsersThreeIcon,
  store: StorefrontIcon,
  mail: EnvelopeSimpleIcon,
  link: LinkSimpleIcon,
} satisfies Record<IconName, typeof CheckIcon>;

export function Icon({ name, size = 20 }: IconProps) {
  const IconComponent = icons[name];
  return <IconComponent aria-hidden="true" className="icon" size={size} weight="bold" />;
}
