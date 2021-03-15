import React, { useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import useSound from "use-sound";
import config from "../../../config";
import LatestMessagesContext from "../../../contexts/LatestMessages/LatestMessages";
import TypingMessage from "./TypingMessage";
import Header from "./Header";
import Footer from "./Footer";
import Message from "./Message";
import "../styles/_messages.scss";

const socket = io(config.BOT_SERVER_ENDPOINT, {
  transports: ["websocket", "polling", "flashsocket"],
});

function Messages() {
  const [playSend] = useSound(config.SEND_AUDIO_URL);
  const [playReceive] = useSound(config.RECEIVE_AUDIO_URL);
  const { messages, setLatestMessage } = useContext(LatestMessagesContext);

  const [botTyping, setBotTyping] = useState(false);
  const [messageList, setMessageList] = useState([
    { user: "bot", message: messages.bot },
  ]);
  const [nextMessage, setNextMessage] = useState("");

  const sendMessage = () => {
    socket.emit("user-message", nextMessage);
    setLatestMessage("bot", nextMessage);
    setMessageList([...messageList, { message: nextMessage, user: "me" }]);
    setNextMessage("");
    playSend();
  };

  const onChangeMessage = (event) => {
    setNextMessage(event.target.value);
  };

  const onReceivedMessage = (botMessage) => {
    setBotTyping(false);
    setMessageList((messageList) => [
      ...messageList,
      { message: botMessage, user: "bot" },
    ]);
    playReceive();
  };

  useEffect(() => {
    socket.on("bot-typing", () => {
      setBotTyping(true);
    });

    socket.on("bot-message", (botMessage) => {
      onReceivedMessage(botMessage);
    });
  }, []);

  return (
    <div className="messages">
      <Header />
      <div className="messages__list" id="message-list">
        {messageList.map((message, index) => {
          return (
            <Message
              botTyping={botTyping}
              message={{
                id: "message" + index,
                message: message.message,
                user: message.user,
              }}
            />
          );
        })}
        {botTyping && <TypingMessage />}
      </div>
      <Footer
        message={nextMessage}
        onChangeMessage={onChangeMessage}
        sendMessage={sendMessage}
      />
    </div>
  );
}

export default Messages;
