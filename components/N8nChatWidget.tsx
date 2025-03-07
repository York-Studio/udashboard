import { useEffect } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

interface N8nChatWidgetProps {
  // Add any props you might need
}

export const N8nChatWidget: React.FC<N8nChatWidgetProps> = () => {
  useEffect(() => {
    // Create the chat widget when the component mounts
    // No need to capture the return value as current version doesn't expose a destroy method
    createChat({
      webhookUrl: 'https://n8n.yorkstudio.io/webhook/1f83e8ac-d465-454a-8327-cef7f0149cb1/chat',
      mode: 'window',
      chatInputKey: 'chatInput',
      chatSessionKey: 'sessionId',
      showWelcomeScreen: true,
      initialMessages: [
        'How can I help you today?'
      ],
      i18n: {
        en: {
          title: 'HOSBO    🤖',
          subtitle: '',
          footer: '',
          getStarted: 'Send us a message',
          inputPlaceholder: 'Type your message here...',
          closeButtonTooltip: 'Close chat',
        },
      },
    });

    // Apply additional styling after the chat is created
    setTimeout(() => {
      // This timeout ensures the elements are in the DOM
      try {
        // Make any additional styling tweaks that can't be done with CSS variables
        const chatHeader = document.querySelector('#n8n-chat .n8n-chat__header');
        if (chatHeader) {
          // Ensure the header styling is applied
          chatHeader.setAttribute('style', 'text-align: center !important; display: flex; flex-direction: column; align-items: center; justify-content: center;');
        }
        
        // Style the title with a nicer font and make the emoji more prominent
        const headerTitle = document.querySelector('#n8n-chat .n8n-chat__header h1');
        if (headerTitle) {
          headerTitle.setAttribute('style', 'font-family: "Montserrat", sans-serif; font-weight: 700; letter-spacing: 1px;');
          if (headerTitle.textContent?.includes('🤖')) {
            headerTitle.innerHTML = headerTitle.innerHTML.replace('🤖', '<span style="font-size: 1.5em; margin-left: 10px;">🤖</span>');
          }
        }
      } catch (error) {
        console.error('Error applying additional styling:', error);
      }
    }, 500);

    // The current n8n chat library doesn't expose a clear cleanup method
    // The widget is mounted to the DOM and remains there
    return () => {
      // Attempt to find and remove the chat elements if necessary
      const chatElement = document.getElementById('n8n-chat');
      if (chatElement) {
        chatElement.innerHTML = '';
      }
    };
  }, []);

  // The component doesn't render anything directly
  // The chat widget is injected into the DOM by the createChat function
  return null;
};

export default N8nChatWidget; 