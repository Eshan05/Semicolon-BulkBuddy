# Gemini AI Assistant Integration Setup

## Overview
BulkBuddy now includes an intelligent AI Assistant powered by Google's Gemini API. The assistant helps users navigate the platform, answer questions about group buying, and provides guidance on features and best practices.

## Features
- **Real-time Chat**: Conversational AI available via floating chat button
- **Platform-Aware**: Trained to help with BulkBuddy-specific features and workflows
- **Context-Aware**: Remembers recent conversation history for better responses
- **Non-Intrusive**: Floating button in bottom-right corner
- **Always Available**: Works across all pages of the application

## AI Assistant Capabilities
The AI Assistant can help with:
- **For Buyers**: Finding pools, joining groups, tracking prices, understanding discounts
- **For Suppliers**: Setting up deals, managing orders, pricing strategies
- **General**: How group buying works, cost savings, product information
- **Navigation**: Feature usage, button locations, page navigation
- **Troubleshooting**: Common issues and solutions

## Setup Instructions

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Select or create a Google Cloud project
4. Copy the generated API key

### 2. Add to Environment Variables

Update your `.env.local` file:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

**Replace** `your_gemini_api_key_here` with your actual Gemini API key.

### 3. Restart Development Server

```bash
npm run dev
```

## How to Use

1. **Open Chat**: Click the blue-green chat bubble in the bottom-right corner
2. **Ask Questions**: Type any question about BulkBuddy or group buying
3. **Get Help**: The AI will provide relevant, helpful responses
4. **Continue Conversation**: Ask follow-up questions - the AI remembers recent context

## Example Queries

### For Buyers:
- "How do I join a group buying pool?"
- "What discounts can I get?"
- "How does dynamic pricing work?"
- "Where can I find suppliers near me?"
- "How do I track price changes in active pools?"

### For Suppliers:
- "How do I create a new deal?"
- "What's the process for setting up multi-tier discounts?"
- "How do I manage orders from buyers?"
- "Can I edit prices after creating a deal?"

### General:
- "What is group buying?"
- "How much can I save using BulkBuddy?"
- "Is my payment information secure?"
- "How do I contact support?"

## API Rate Limits

Google Gemini API has the following limits:
- **Free tier**: 60 requests per minute
- **Paid tier**: Variable based on subscription

For production use, consider implementing:
- Request queuing
- Rate limit handling
- User-level quotas

## Error Handling

If the AI Assistant shows an error:

1. **"API key not configured"** - Add `NEXT_PUBLIC_GEMINI_API_KEY` to `.env.local`
2. **"Failed to get response"** - Check your internet connection and API key validity
3. **Rate limit exceeded** - Wait a moment and try again

## Customization

### Change the System Prompt

Edit the `SYSTEM_PROMPT` in [components/features/ai-assistant.tsx](../components/features/ai-assistant.tsx):

```typescript
const SYSTEM_PROMPT = `Your custom instructions here...`;
```

### Modify Chat Appearance

Customize styling in the component:
- Change colors (gradient colors, button colors)
- Adjust chat window size (width, height)
- Modify message styling
- Update header text

### Add New Features

Possible enhancements:
- [ ] Save chat history to localStorage
- [ ] Export conversation as PDF
- [ ] Multi-language support
- [ ] User preferences/settings
- [ ] Integration with support tickets
- [ ] Product recommendations based on chat
- [ ] Analytics on common questions

## Technical Details

### Component Structure
- **Location**: [components/features/ai-assistant.tsx](../components/features/ai-assistant.tsx)
- **Used In**: Root layout (app/layout.tsx)
- **Dependencies**: @google/generative-ai
- **Type**: Client component (uses 'use client')

### State Management
- Messages: Array of Message objects
- Input: Current user input text
- Loading: API request status
- Error: Error messages
- GenAI: Gemini API instance

### Message History
- Stores last 10 messages for context
- Includes timestamps for each message
- User and assistant roles clearly marked
- Auto-scrolls to latest message

## Security Considerations

1. **API Key Protection**:
   - Never commit `.env.local` to version control
   - Use `NEXT_PUBLIC_` prefix only for frontend-safe keys
   - Rotate API keys periodically

2. **User Data**:
   - Chat history is stored in browser memory
   - Not persisted to server by default
   - Clear browser data to remove conversation

3. **Content Filtering**:
   - Gemini API has built-in safety filters
   - Inappropriate requests are blocked
   - Suspicious patterns are detected

## Troubleshooting

### Chat Button Not Visible
- Check that AIAssistant component is imported in root layout
- Verify z-index isn't being overridden by other elements
- Clear browser cache (Ctrl+Shift+Delete)

### Chat Not Responding
- Check console for error messages (F12 → Console)
- Verify API key is correct in `.env.local`
- Check internet connection
- Try refreshing the page

### Slow Responses
- Gemini API responses take 2-5 seconds normally
- If longer, check your internet speed
- Large message histories may slow responses

## Costs

Gemini API is **free to use** with rate limits:
- No credit card required for free tier
- Generous free tier (60 requests/minute)
- Upgrade anytime if you exceed limits

Check [Google Gemini Pricing](https://ai.google.dev/pricing) for current rates.

## Future Enhancements

Planned features:
- [ ] AI-powered product recommendations
- [ ] Intelligent price negotiation suggestions
- [ ] Automated report generation
- [ ] Multi-language support
- [ ] Integration with email notifications
- [ ] Conversation analytics dashboard

## Support

For issues with the AI Assistant:
1. Check this documentation
2. Review error messages in browser console (F12)
3. Visit [Google AI Help](https://support.google.com/ai)
4. Check API key validity at [Google AI Studio](https://makersuite.google.com/app/apikey)
