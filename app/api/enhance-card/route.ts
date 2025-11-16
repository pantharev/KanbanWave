import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { title, description, templateType, apiKey } = await request.json();

    // Validate API key
    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'OpenAI API key is required. Please add your API key in Settings.' },
        { status: 400 }
      );
    }

    // Validate inputs
    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Card title is required' },
        { status: 400 }
      );
    }

    if (!templateType || typeof templateType !== 'string') {
      return NextResponse.json(
        { error: 'Template type is required' },
        { status: 400 }
      );
    }

    // Initialize OpenAI client with user's API key
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Template-specific system prompts
    const templatePrompts: Record<string, string> = {
      general: `You are an expert at improving task descriptions. Enhance the title and description to be clear, actionable, and well-structured. Focus on:
- Making the title concise and descriptive (NOT a request to someone, but a direct task statement)
- Breaking down the description into clear steps or sections
- Adding relevant details and context
- Using professional but friendly tone
IMPORTANT: Write tasks as direct action statements, not as requests (e.g., "Organize photos by date" not "Can you help organize photos")`,

      marketing: `You are a marketing expert. Enhance the title and description with marketing best practices. Focus on:
- Compelling, action-oriented language (direct statements, not requests)
- Clear value propositions and benefits
- Target audience considerations
- Measurable goals and KPIs
- Brand voice consistency
IMPORTANT: Write as direct action items (e.g., "Launch email campaign targeting millennials" not "Can you help launch a campaign")`,

      'artistic-creative': `You are a creative director. Enhance the title and description with artistic and creative considerations. Focus on:
- Vivid, inspiring language (direct creative direction, not requests)
- Creative vision and aesthetic goals
- Mood, tone, and style references
- Artistic techniques and mediums
- Visual and sensory details
IMPORTANT: Write as direct creative briefs (e.g., "Design minimalist logo with earthy tones" not "Help me design a logo")`,

      coding: `You are a senior software engineer. Enhance the title and description with technical best practices. Focus on:
- Clear technical requirements (direct implementation tasks, not requests to AI)
- Implementation approach and architecture
- Performance and scalability considerations
- Testing requirements
- Code quality standards
IMPORTANT: Write as direct development tasks (e.g., "Implement user authentication with JWT" not "Can you help implement authentication")`,

      business: `You are a business consultant. Enhance the title and description with business strategy focus. Focus on:
- Strategic objectives and ROI (direct business actions, not requests)
- Stakeholder considerations
- Risk assessment and mitigation
- Timeline and resource requirements
- Success metrics and KPIs
IMPORTANT: Write as direct business initiatives (e.g., "Analyze Q4 sales data for growth opportunities" not "Help analyze sales")`,

      law: `You are a legal professional. Enhance the title and description with legal considerations. Focus on:
- Precise, unambiguous language (direct legal tasks, not requests)
- Compliance and regulatory requirements
- Risk factors and liabilities
- Documentation and evidence needs
- Deadlines and legal procedures
IMPORTANT: Write as direct legal actions (e.g., "Review contract for liability clauses" not "Can you review this contract")`,

      medicine: `You are a medical professional. Enhance the title and description with healthcare best practices. Focus on:
- Patient safety and care quality (direct medical tasks, not requests)
- Clinical protocols and standards
- Medical terminology accuracy
- Regulatory compliance (HIPAA, etc.)
- Evidence-based approaches
IMPORTANT: Write as direct medical actions (e.g., "Update patient protocol for diabetes management" not "Help update protocol")`,

      construction: `You are a construction project manager. Enhance the title and description with construction industry focus. Focus on:
- Safety requirements and protocols (direct construction tasks, not requests)
- Materials and equipment needs
- Building codes and regulations
- Timeline and milestones
- Quality control measures
IMPORTANT: Write as direct project tasks (e.g., "Install HVAC system per building code 2024" not "Help install HVAC")`,

      hospitality: `You are a hospitality manager. Enhance the title and description with customer service excellence. Focus on:
- Guest experience and satisfaction (direct service tasks, not requests)
- Service standards and quality
- Staff training and coordination
- Operational efficiency
- Health and safety compliance
IMPORTANT: Write as direct operational tasks (e.g., "Train front desk staff on new check-in system" not "Help train staff")`,

      finance: `You are a financial analyst. Enhance the title and description with financial best practices. Focus on:
- Financial metrics and analysis (direct financial tasks, not requests)
- Budget and cost considerations
- Compliance and regulations
- Risk management
- ROI and value creation
IMPORTANT: Write as direct financial actions (e.g., "Prepare Q1 budget forecast with variance analysis" not "Help prepare budget")`,

      personal: `You are a productivity coach. Enhance the title and description for personal task management. Focus on:
- Clear, achievable goals (direct personal actions, not requests)
- Step-by-step action items
- Time management considerations
- Personal motivation and accountability
- Work-life balance
IMPORTANT: Write as direct personal tasks (e.g., "Organize vacation photos by date and location" not "Can you help organize photos")`,
    };

    const systemPrompt = templatePrompts[templateType] || templatePrompts.general;

    // Generate enhanced content using OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Enhance the following task card:

Title: ${title}
Description: ${description || '(No description provided)'}

Please provide:
1. An improved, concise title (max 100 characters) - write as a DIRECT ACTION STATEMENT, not a request
2. An enhanced description that follows the template guidelines - use actionable, concrete language

CRITICAL: The output should be formatted as tasks/actions to DO, not requests for help.
- GOOD: "Organize vacation photos by date and location"
- BAD: "Can you help organize my vacation photos?"
- GOOD: "Implement user authentication with JWT"
- BAD: "Hey Claude, can you help implement authentication?"

Return ONLY a JSON object with this exact format:
{
  "title": "enhanced title here",
  "description": "enhanced description here"
}

Do not include any additional text, markdown formatting, or explanation outside the JSON object.`,
        },
      ],
    });

    // Extract the generated content
    const content = response.choices[0].message.content || '';

    // Parse the JSON response
    try {
      const enhanced = JSON.parse(content);

      if (!enhanced.title || !enhanced.description) {
        throw new Error('Invalid response format');
      }

      return NextResponse.json({
        title: enhanced.title,
        description: enhanced.description,
      });
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error enhancing card:', error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API Error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to enhance card' },
      { status: 500 }
    );
  }
}
