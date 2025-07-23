import { bold, CommandHandler, fmt, italic, Module, updateMessage } from "$xor";
import { getUser, wrapRpcErrors } from "./helpers.ts";

const admin: Module = {
  name: "admin",
  handlers: [
    new CommandHandler("promote", async ({ client, event, args }) => {
      const chat = event.msg.chat;
      if (!chat) {
        return;
      }
      const user = await getUser(event, client, args, true);
      if (!user) {
        await updateMessage(client, event, "User not found.");
        return;
      }
      if (["channel", "supergroup"].includes(chat.type)) {
        await wrapRpcErrors(client, event, async () => {
          await client.invoke({
            _: "channels.editAdmin",
            channel: await client.getInputChannel(chat.id),
            user_id: await client.getInputUser(user.entity.id),
            admin_rights: {
              _: "chatAdminRights",
              change_info: true,
              delete_messages: true,
              edit_messages: true,
              invite_users: true,
              manage_call: true,
              pin_messages: true,
              add_admins: true,
              ban_users: true,
            },
            rank: user.rank,
          });
          await updateMessage(client, event, "User promoted.");
        });
      } else {
        await updateMessage(client, event, "Cannot promote here.");
      }
    }),
    new CommandHandler("demote", async ({ client, event, args }) => {
      const chat = event.msg.chat;
      if (!chat) {
        return;
      }
      const user = await getUser(event, client, args);
      if (!user) {
        await updateMessage(client, event, "User not found.");
        return;
      }
      if (["channel", "supergroup"].includes(chat.type)) {
        await wrapRpcErrors(client, event, async () => {
          await client.invoke({
            _: "channels.editAdmin",
            channel: await client.getInputChannel(chat.id),
            user_id: await client.getInputUser(user.entity.id),
            admin_rights: {
              _: "chatAdminRights",
            },
            rank: "",
          });
          await updateMessage(client, event, "User demoted.");
        });
      } else {
        await updateMessage(client, event, "Cannot demote here.");
      }
    }),
    new CommandHandler("ban", async ({ client, event, args }) => {
      const chat = event.msg.chat;
      if (!chat) {
        return;
      }
      const user = await getUser(event, client, args);
      if (!user) {
        await updateMessage(client, event, "User not found.");
        return;
      }
      await wrapRpcErrors(client, event, async () => {
        await client.invoke({
          _: "channels.editBanned",
          channel: await client.getInputChannel(chat.id),
          participant: await client.getInputPeer(user.entity.id),
          banned_rights: {
            _: "chatBannedRights",
            view_messages: true,
            send_messages: true,
            send_media: true,
            send_stickers: true,
            send_gifs: true,
            send_games: true,
            send_inline: true,
            embed_links: true,
            send_polls: true,
            change_info: true,
            invite_users: true,
            pin_messages: true,
            until_date: 0,
          },
        });
        await updateMessage(client, event, "User banned.");
      });
    }),
    new CommandHandler("unban", async ({ client, event, args }) => {
      const chat = event.msg.chat;
      if (!chat) {
        return;
      }
      const user = await getUser(event, client, args);
      if (!user) {
        await updateMessage(client, event, "User not found.");
        return;
      }
      await wrapRpcErrors(client, event, async () => {
        await client.invoke({
          _: "channels.editBanned",
          channel: await client.getInputChannel(chat.id),
          participant: await client.getInputPeer(user.entity.id),
          banned_rights: {
            _: "chatBannedRights",
            until_date: 0,
          },
        });
        await updateMessage(client, event, "User unbanned.");
      });
    }),
    new CommandHandler("pin", async ({ client, event, args }) => {
      const chat = event.msg.chat;
      if (!chat) {
        return;
      }
      const reply = await client.getMessage(
        chat.id,
        event.msg.replyToMessageId!
      );
      if (reply) {
        await wrapRpcErrors(client, event, async () => {
          await client.invoke({
            _: "messages.updatePinnedMessage",
            peer: await client.getInputPeer(chat.id),
            id: reply.id,
            silent: args[0] === "silent" || undefined,
          });
          await updateMessage(client, event, "Message pinned.");
        });
      } else {
        await updateMessage(client, event, "Reply a message to pin.");
      }
    }),
    new CommandHandler("unpin", async ({ client, event }) => {
      const chat = event.msg.chat;
      if (!chat) {
        return;
      }
      const reply = await client.getMessage(
        chat.id,
        event.msg.replyToMessageId!
      );
      if (reply) {
        await wrapRpcErrors(client, event, async () => {
          await client.invoke({
            _: "messages.updatePinnedMessage",
            peer: await client.getInputPeer(chat.id),
            id: reply.id,
            unpin: true,
          });
          await updateMessage(client, event, "Message unpinned.");
        });
      } else {
        await updateMessage(client, event, "Reply a pinned message to unpin.");
      }
    }),
    new CommandHandler("add", async ({ client, event, args }) => {
      const chat = event.msg.chat;
      if (!chat) {
        return;
      }
      const user = await getUser(event, client, args);
      if (!user) {
        await updateMessage(client, event, "User not found.");
        return;
      }
      await wrapRpcErrors(client, event, async () => {
        await client.invoke({
          _: "channels.inviteToChannel",
          channel: await client.getInputChannel(chat.id),
          users: [await client.getInputUser(user.entity.id)],
        });
        await updateMessage(client, event, "User added.");
      });
    }),
  ],
  help: fmt`${bold("Introduction")}

This module aims to make administering chats easy.

${bold("Commands")}

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

${italic(
  "Note: The commands above work by replying to a user or passing their username or ID as the first argument."
)}

- pin

Pins the replied message in the chat. Pass "silent" to not notify the members.

- unpin

Unpins the replied pinned message.`,
};

export default admin;
