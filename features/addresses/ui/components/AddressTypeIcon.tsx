import { ADDRESS_TYPE_OPTIONS } from "../../domain/constants/address.constants";

export function AddressTypeIcon({ type }: { type: string }) {
  const config = ADDRESS_TYPE_OPTIONS.find((t) => t.value === type);
  if (!config) return null;
  const Icon = config.icon;
  return (
    <span aria-label={`Tipo: ${config.label}`}>
      <Icon className={config.color} size={28} aria-hidden="true" />
    </span>
  );
}
