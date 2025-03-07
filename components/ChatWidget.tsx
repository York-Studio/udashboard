import { useEffect } from 'react';
import Head from 'next/head';

const ChatWidget = () => {
  return (
    <Head>
      <script
        id="chat-widget-config"
        dangerouslySetInnerHTML={{
          __html: `
            window.ChatWidgetConfig = {
                webhook: {
                    url: 'https://n8n.yorkstudio.io/webhook/1f83e8ac-d465-454a-8327-cef7f0149cb1/chat',
                    route: 'general',
                    chatInputKey: 'chatInput',
                    chatSessionKey: 'sessionId'
                },
                branding: {
                    logo: 'https://static.wixstatic.com/media/7e4758_e932d44784ff4328b86f838bf98f102a~mv2.png/v1/fill/w_372,h_264,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/7e4758_e932d44784ff4328b86f838bf98f102a~mv2.png',
                    name: 'The Old Thatch',
                    welcomeText: 'Hi 👋, how can I assist you?',
                    responseTimeText: 'AI response time can vary, blame OpenAI!'
                },
                style: {
                    primaryColor: '#2e2e30',
                    secondaryColor: '#2e2e30',
                    position: 'right',
                    backgroundColor: '#ffffff',
                    fontColor: '#333333'
                }
            };
          `
        }}
      />
      <script
        id="chat-widget-script"
        src="/chat-widget.js"
      />
    </Head>
  );
};

export default ChatWidget; 