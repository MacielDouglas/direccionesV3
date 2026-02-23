"use server";

import { getCurrentUser } from "@/server/users";
import { createAddressService } from "./address.service";
import { AddressFormData } from "../domain/address.schema";
// import { uploadAddressImage } from "./address-image.service";

export async function createAddressAction(input: AddressFormData) {
  const session = await getCurrentUser();

  return createAddressService({
    input,
    organizationId: session!.activeMember!.organizationId,
    userId: session!.user.id,
  });
}

// "use server";

// import { getCurrentUser } from "@/server/users";
// import { createAddressService } from "../services/address.service";
// import { AddressFormData } from "../domain/address.schema";

// export async function createAddressAction(input: AddressFormData) {
//   const session = await getCurrentUser();

//   return createAddressService({
//     input,
//     organizationId: session?.activeMember?.organizationId || "",
//     userId: session?.user.id || "",
//   });
// }
