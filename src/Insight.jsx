class LangflowClient {
  constructor(baseURL, applicationToken) {
    this.baseURL = baseURL;
    this.applicationToken = applicationToken;
  }

  async post(endpoint, body, headers = { "Content-Type": "application/json" }) {
    headers["Authorization"] = `Bearer ${this.applicationToken}`;
    const url = `${this.baseURL}${endpoint}`;
    try {
      console.log("POST Request Details:", { url, headers, body });
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      console.log("Response Status:", response.status);

      const responseText = await response.text();
      try {
        return JSON.parse(responseText);
      } catch {
        console.warn("Response is not valid JSON:", responseText);
        return responseText;
      }
    } catch (error) {
      console.error("Request failed:", { url, body, error: error.message });
      throw error;
    }
  }

  async initiateSession(
    flowId,
    langflowId,
    inputValue,
    inputType = "chat",
    outputType = "chat",
    stream = false,
    tweaks = {}
  ) {
    const endpoint = `/lf/${langflowId}/api/v1/run/${flowId}?stream=${stream}`;
    return this.post(endpoint, {
      input_value: inputValue,
      input_type: inputType,
      output_type: outputType,
      tweaks,
    });
  }

  handleStream(streamUrl, onUpdate, onClose, onError) {
    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    eventSource.onerror = (event) => {
      console.error("Stream Error:", event);
      onError(event);
      eventSource.close();
    };

    eventSource.addEventListener("close", () => {
      onClose("Stream closed");
      eventSource.close();
    });

    return eventSource;
  }

  async runFlow(
    flowIdOrName,
    langflowId,
    inputValue,
    inputType = "chat",
    outputType = "chat",
    tweaks = {},
    stream = false,
    onUpdate,
    onClose,
    onError
  ) {
    try {
      const initResponse = await this.initiateSession(
        flowIdOrName,
        langflowId,
        inputValue,
        inputType,
        outputType,
        stream,
        tweaks
      );
      console.log("Init Response:", initResponse);
      if (
        stream &&
        initResponse &&
        initResponse.outputs &&
        initResponse.outputs[0].outputs[0].artifacts.stream_url
      ) {
        const streamUrl =
          initResponse.outputs[0].outputs[0].artifacts.stream_url;
        console.log(`Streaming from: ${streamUrl}`);
        this.handleStream(streamUrl, onUpdate, onClose, onError);
      }
      return initResponse;
    } catch (error) {
      console.error("Error running flow:", error);
      onError("Error initiating session");
    }
  }
}

export default async function main(
  inputValue,
  inputType = "chat",
  outputType = "chat",
  stream = false
) {
  const flowIdOrName = "60abd8b1-0641-456d-8a70-a3c1cf397c71";
  const langflowId = "408100d8-bf77-4c52-9e3d-884294054b14";
  const applicationToken = import.meta.env.VITE_MODEL_TOKEN;
  const langflowClient = new LangflowClient("/api", applicationToken);

  try {
    const tweaks = {
      "AstraDBCQLToolComponent-4thc6": {
        api_endpoint:
          "https://0123eeed-3c3b-4058-bd52-c62384bd00bb-us-east1.apps.astra.datastax.com",
        clustering_keys: {},
        keyspace: "social",
        number_of_results: 5,
        partition_keys: {
          post_id: "unique",
        },
        projection_fields: "*",
        static_filters: {},
        table_name: "posts",
        token: "ASTRA_DB_APPLICATION_TOKEN",
        tool_description:
          "A Database Which Contains Mock Data For  Social Media Performance Analysis",
        tool_name: "Database",
      },
      "TextOutput-cDlS0": {
        input_value: "",
      },
      "ChatInput-oBuHh": {
        files: "",
        background_color: "",
        chat_icon: "",
        user_input: "and likes",
        sender: "User",
        sender_name: "User",
        session_id: "",
        should_store_message: true,
        text_color: "",
      },
      "Agent-hCYZ0": {
        add_current_date_tool: true,
        agent_description:
          "A helpful assistant with access to the following tools:",
        agent_llm: "Groq",
        handle_parsing_errors: true,
        input_value: "",
        max_iterations: 15,
        n_messages: 100,
        order: "Ascending",
        sender: "Machine and User",
        sender_name: "",
        session_id: "",
        system_prompt:
          "You are a Social Media Performance Analysis assistant that can use tools to analyse Social Media Performance and perform tasks and answer.",
        template: "{sender_name}: {text}",
        verbose: true,
        groq_api_key:
          "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",
        groq_api_base: "https://api.groq.com",
        max_tokens: null,
        temperature: 0.1,
        n: null,
        model_name: "llama-3.1-8b-instant",
      },
    };

    let response = await langflowClient.runFlow(
      flowIdOrName,
      langflowId,
      inputValue,
      inputType,
      outputType,
      tweaks,
      stream,
      (data) => console.log("Received:", data.chunk), // onUpdate
      (message) => console.log("Stream Closed:", message), // onClose
      (error) => console.log("Stream Error:", error) // onError
    );

    if (!stream && response && response.outputs) {
      const flowOutputs = response.outputs[0];
      const firstComponentOutputs = flowOutputs.outputs[0];
      const output = firstComponentOutputs.outputs.message;

      console.log("Final Output:", output.message.text);
    }
  } catch (error) {
    console.error("Main Error", error.message);
  }
}
