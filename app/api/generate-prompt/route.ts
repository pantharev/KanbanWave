import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const { title, description, priority, attachments, comments, assignee } =
      await request.json();

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Card title is required' },
        { status: 400 }
      );
    }

    // Build context from card data
    let context = `Card Title: ${title}`;
    if (description) context += `\nCard Description: ${description}`;
    if (priority) context += `\nPriority: ${priority}`;
    if (attachments) context += `\nAttachments: ${attachments}`;
    if (comments) context += `\nComments: ${comments}`;
    if (assignee) context += `\nAssigned to: ${assignee}`;

    // Generate prompt using OpenAI
    const message = await openai.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a helpful assistant that converts task cards into clear, actionable prompts for developers using Claude Code.

Based on the following card information, generate a simple, non-technical prompt that a developer could use to ask Claude Code to build this feature. Keep it conversational and straightforward.

${context}

Generate a prompt that:
1. Describes what needs to be built in simple terms
2. Includes key requirements from the card
3. Is actionable and clear
4. Is suitable for giving to Claude Code

Just provide the prompt text, without any preamble or explanation.`,
        },
      ],
    });

    // Extract the generated prompt
    const generatedPrompt =
      message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ prompt: generatedPrompt });
  } catch (error) {
    console.error('Error generating prompt:', error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API Error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate prompt' },
      { status: 500 }
    );
  }
}
