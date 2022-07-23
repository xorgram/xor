import { Api } from "$grm";
import { CommandHandler, Methods, Module, updateMessage } from "$xor";
import { getUser, wrapRpcErrors } from "./helpers.ts";

const admin: Module = {
  name: "admin",
  handlers: [
    new CommandHandler("promote", async ({ client, event, args }) => {
      const chat = await event.message.getChat();
      if (!chat) {
        return;
      }
      const user = await getUser(event, client, args, true);
      if (!user) {
        await event.message.edit({ text: "User not found." });
        return;
      }
      if (chat instanceof Api.Channel) {
        const xor = new Methods(client);
        await wrapRpcErrors(event, async () => {
          await xor.promoteChatMember({
            chatId: chat.id,
            userId: user.entity,
            rank: user.rank,
            canChangeInfo: chat.adminRights?.changeInfo,
            canDeleteMessages: chat.adminRights?.deleteMessages,
            canEditMessages: chat.adminRights?.editMessages,
            canInviteUsers: chat.adminRights?.inviteUsers,
            canManageCalls: chat.adminRights?.manageCall,
            canPinMessages: chat.adminRights?.pinMessages,
            canPromoteMembers: chat.adminRights?.addAdmins,
            canRestrictMembers: chat.adminRights?.banUsers,
          });
          await updateMessage(event, "User promoted.");
        });
      } else {
        await updateMessage(event, "Cannot promote here.");
      }
    }),
    new CommandHandler("demote", async ({ client, event, args }) => {
      const chat = await event.message.getChat();
      if (!chat) {
        return;
      }
      const user = await getUser(event, client, args);
      if (!user) {
        await updateMessage(event, "User not found.");
        return;
      }
      if (chat instanceof Api.Channel) {
        const xor = new Methods(client);
        await wrapRpcErrors(event, async () => {
          await xor.promoteChatMember({
            chatId: chat.id,
            userId: user.entity,
            rank: user.rank,
            canManageChat: false,
          });
          await updateMessage(event, "User demoted.");
        });
      } else {
        await updateMessage(event, "Cannot demote here.");
      }
    }),
    new CommandHandler("ban", async ({ client, event, args }) => {
      const chat = await event.message.getChat();
      if (!chat) {
        return;
      }
      const user = await getUser(event, client, args);
      if (!user) {
        await updateMessage(event, "User not found.");
        return;
      }
      await wrapRpcErrors(event, async () => {
        const xor = new Methods(client);
        await xor.banChatMember({
          chatId: chat.id,
          userId: await client.getEntity(user.entity),
        });
        await updateMessage(event, "User banned.");
      });
    }),
    new CommandHandler("unban", async ({ client, event, args }) => {
      const chat = await event.message.getChat();
      if (!chat) {
        return;
      }
      const user = await getUser(event, client, args);
      if (!user) {
        await updateMessage(event, "User not found.");
        return;
      }
      await wrapRpcErrors(event, async () => {
        const xor = new Methods(client);
        await xor.unbanChatMember({
          chatId: chat.id,
          userId: await client.getEntity(user.entity),
        });
        await updateMessage(event, "User unbanned.");
      });
    }),
    new CommandHandler("pin", async ({ client, event, args }) => {
      const chat = await event.message.getChat();
      if (!chat) {
        return;
      }
      const reply = await event.message.getReplyMessage();
      if (reply) {
        const xor = new Methods(client);
        await wrapRpcErrors(event, async () => {
          await xor.pinChatMessage({
            chatId: chat.id,
            messageId: reply.id,
            disableNotification: args[0] === "silent",
          });
          await updateMessage(event, "Message pinned.");
        });
      } else {
        await updateMessage(event, "Reply a message to pin.");
      }
    }),
    new CommandHandler("unpin", async ({ client, event }) => {
      const chat = await event.message.getChat();
      if (!chat) {
        return;
      }
      const reply = await event.message.getReplyMessage();
      if (reply) {
        const xor = new Methods(client);
        await wrapRpcErrors(event, async () => {
          const resp = await xor.unpinChatMessage({
            chatId: chat.id,
            messageId: reply.id,
          });
          if (resp instanceof Api.Updates) {
            await updateMessage(
              event,
              resp.updates.length
                ? "Message unpinned."
                : "Message was not pinned.",
            );
          }
        });
      } else {
        await updateMessage(event, "Reply a pinned message to unpin.");
      }
    }),
    new CommandHandler("add", async ({ client, event, args }) => {
      const chat = await event.message.getChat();
      if (!chat) {
        return;
      }
      const user = await getUser(event, client, args);
      if (!user) {
        await updateMessage(event, "User not found.");
        return;
      }
      await wrapRpcErrors(event, async () => {
        const xor = new Methods(client);
        await xor.addChatMembers({ chatId: chat, userId: user.entity });
        await updateMessage(event, "User added.");
      });
    }),
  ],
  help: `**Introduction**

This module aims to make administering chats easy.

**Commands**

- promote

Promotes the requested user in the chat. Takes admin title as argument.

- demote

Demotes the requested user in the chat.

- ban

Bans the requested user from the chat.

- unban

Unbans the requested user from the chat.

- add

Adds the requested user to the chat.

*Note: The commands above work by replying to a user or passing their ID or handle as the first argument.*

- pin

Pins the replied message in the chat. Pass "silent" to not notify the members.

- unpin

Unpins the replied pinned message.`,
};

export default admin;
