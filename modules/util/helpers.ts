import { Api } from "$mtkruto";
import { Client } from "$xor";

const kv = (k: string, v: unknown) => `${k}: ${String(v)}\n`;

export async function whois(entity: Api.AnyType, client: Client) {
  let whois = "";
  if (Api.is("chat", entity)) {
    const { full_chat } = await client.invoke({
      _: "messages.getFullChat",
      chat_id: entity.id,
    });
    whois += kv("ID", entity.id);
    whois += kv(
      "DC",
      Api.is("chatPhoto", entity.photo) ? entity.photo.dc_id : "N/A"
    );
    whois += kv("Name", entity.title);
    whois += kv("Membership", entity.left ? "Not member" : "Member");
    whois += "\n" + (full_chat.about ?? "");
  } else if (Api.is("channel", entity)) {
    const { full_chat } = await client.invoke({
      _: "channels.getFullChannel",
      channel: await client.getInputChannel(entity.id.toString()),
    });
    whois += kv("ID", entity.id);
    whois += kv(
      "DC",
      Api.is("chatPhoto", entity.photo) ? entity.photo.dc_id : "N/A"
    );
    whois += kv("Name", entity.title);
    whois += kv("Username", entity.username);
    whois += kv("Membership", entity.left ? "Not member" : "Member");
    whois += "\n" + (full_chat.about ?? "");
  } else if (Api.is("user", entity)) {
    const { full_user } = await client.invoke({
      _: "users.getFullUser",
      id: await client.getInputUser(entity.id.toString()),
    });
    whois += kv("ID", entity.id);
    whois += kv(
      "DC",
      Api.is("userProfilePhoto", entity.photo) ? entity.photo.dc_id : "N/A"
    );
    whois += kv("Name", entity.first_name + " " + (entity.last_name ?? ""));
    whois += kv("Username", entity.username);
    whois += "\n" + (full_user.about ?? "");
  } else {
    whois += "Could not resolve whois";
  }
  return whois;
}
