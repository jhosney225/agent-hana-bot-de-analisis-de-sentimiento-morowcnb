
```javascript
import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

const client = new Anthropic();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function analyzeSentiment(newsText) {
  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a financial news sentiment analyzer. Analyze the following financial news and provide:
1. Overall sentiment (Positive, Negative, Neutral)
2. Sentiment score (-1.0 to 1.0, where -1 is most negative and 1 is most positive)
3. Key financial indicators or terms mentioned
4. Risk level assessment (High, Medium, Low)
5. Brief summary of the impact

Financial News:
"${newsText}"

Respond in JSON format with keys: sentiment, score, indicators, risk_level, impact_summary`,
      },
    ],
  });

  try {
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      sentiment: "Error",
      score: 0,
      indicators: [],
      risk_level: "Unknown",
      impact_summary: responseText,
    };
  } catch (error) {
    return {
      sentiment: "Error",
      score: 0,
      indicators: [],
      risk_level: "Unknown",
      impact_summary: "Failed to parse response",
    };
  }
}

function displayAnalysis(analysis) {
  console.log("\n" + "=".repeat(60));
  console.log("SENTIMENT ANALYSIS RESULTS");
  console.log("=".repeat(60));

  if (analysis.sentiment === "Error") {
    console.log(`Analysis: ${analysis.impact_summary}`);
  } else {
    console.log(`📊 Overall Sentiment: ${analysis.sentiment}`);
    console.log(
      `📈 Sentiment Score: ${analysis.score} (range: -1.0 to 1.0)`
    );

    if (analysis.indicators && analysis.indicators.length > 0) {
      console.log(`🎯 Key Financial Indicators:`);
      if (Array.isArray(analysis.indicators)) {
        analysis.indicators.forEach((indicator) => {
          console.log(`   - ${indicator}`);
        });
      }
    }

    console.log(`⚠️  Risk Level: ${analysis.risk_level}`);
    console.log(`💡 Impact Summary: ${analysis.impact_summary}`);
  }

  console.log("=".repeat(60) + "\n");
}

async function interactiveMode() {
  console.log("\n🤖 Financial News Sentiment Analyzer");
  console.log("=====================================");
  console.log(
    "This tool analyzes financial news for sentiment and market impact.\n"
  );

  const sampleNews = [
    "Apple Inc. reported record quarterly earnings of $120 billion, beating analyst expectations by 15%. The company announced a new product line and increased dividends.",
    "The Federal Reserve raised interest rates by 0.5%, expressing concerns about inflation. Tech stocks fell sharply on the news.",
    "Oil prices surged 8% following geopolitical tensions in the Middle East. Energy sector stocks showed mixed reactions.",
  ];

  console.log("Sample News Articles for Analysis:");
  sampleNews.forEach((news, index) => {
    console.log(`\n${index + 1}. "${news}"`);
  });

  let continueAnalysis = true;

  while (continueAnalysis) {
    console.log(
      "\nChoose an option: (1-3) for sample news, 'custom' for custom news, or 'exit' to quit"
    );
    const choice = await question("Your choice: ");

    if (choice.toLowerCase() === "exit") {
      continueAnalysis = false;
      console.log("Thank you for using the Financial News Sentiment Analyzer!");
    } else if (choice.toLowerCase() === "custom") {
      const customNews = await question(
        "Enter your financial news text: "
      );
      if (customNews.trim()) {
        console.log("\nAnalyzing your news...");
        const analysis = await analyzeSentiment(customNews);
        displayAnalysis(analysis);
      }
    } else {
      const index = parseInt(choice) - 1;
      if (index >= 0 && index < sampleNews.length) {
        console.log("\nAnalyzing sample news...");
        const analysis = await analyzeSentiment(sampleNews[index]);
        displayAnalysis(analysis);
      } else {
        console.log("Invalid choice. Please try again.");
      }
    }
  }

  rl.close();
}

async function demonstrationMode() {
  console.log("\n🤖 Financial News Sentiment Analyzer - Demo Mode");
  console.log("=".repeat(60));
  console.log("Running automated demonstration with sample financial news...\n");

  const demoNews = [
    {
      title: "Tech Stock Surge",
      content:
        "Microsoft announced a major breakthrough in AI technology, increasing productivity by 40%. The stock surged 12% in after-hours trading amid investor enthusiasm.",
    },
    {
      title: "Banking Crisis Warning",
      content:
        "Three major banks reported significant losses due to commercial real estate exposure. Credit rating agencies are reviewing their ratings downward.",
    },
    {
      title: "Renewable Energy Expansion",
      content:
        "The government approved $50 billion in renewable energy subsidies. Solar and wind companies saw