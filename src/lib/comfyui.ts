
import workflowTemplate from "./nebula_sdxl_api.json";

const COMFYUI_URL =
  process.env.COMFYUI_URL ?? "http://127.0.0.1:8188";

type WorkflowNode = {
  inputs: Record<string, unknown>;
  class_type: string;
  _meta?: { title: string };
};

type Workflow = Record<string, WorkflowNode>;

type ComfyImage = {
  filename: string;
  subfolder: string;
  type: string;
};

export async function generateCharacterImage(
  prompt: string
): Promise<Buffer> {
  // Cria uma cópia para não modificar o template original.
  const workflow = structuredClone(
    workflowTemplate
  ) as Workflow;

  // Nó 2: descrição visual do personagem.
  workflow["2"].inputs.text = prompt;

  // Nó 5: seed diferente a cada geração.
  workflow["5"].inputs.seed = Math.floor(
    Math.random() * 1_000_000_000_000
  );

  const queueResponse = await fetch(
    `${COMFYUI_URL}/prompt`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: workflow,
        client_id: crypto.randomUUID(),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    }
  );

  if (!queueResponse.ok) {
    const details = await queueResponse.text();

    throw new Error(
      `ComfyUI recusou o workflow: ${details.slice(0, 1000)}`
    );
  }

  const queueData = (await queueResponse.json()) as {
    prompt_id?: string;
  };

  if (!queueData.prompt_id) {
    throw new Error(
      "ComfyUI não retornou o identificador da geração."
    );
  }

  const promptId = queueData.prompt_id;

  // Aguarda a geração por até 3 minutos.
  const deadline = Date.now() + 180_000;

  while (Date.now() < deadline) {
    await new Promise<void>((resolve) =>
      setTimeout(resolve, 1500)
    );

    const historyResponse = await fetch(
      `${COMFYUI_URL}/history/${encodeURIComponent(promptId)}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!historyResponse.ok) {
      throw new Error(
        "Não foi possível consultar o progresso no ComfyUI."
      );
    }

    const history = (await historyResponse.json()) as Record<
      string,
      {
        status?: {
          status_str?: string;
          completed?: boolean;
        };
        outputs?: Record<
          string,
          { images?: ComfyImage[] }
        >;
      }
    >;

    const result = history[promptId];

    if (!result) {
      continue;
    }

    if (result.status?.status_str === "error") {
      throw new Error(
        "O ComfyUI encontrou um erro ao gerar a imagem."
      );
    }

    const image = result.outputs?.["7"]?.images?.[0];

    if (!image) {
      if (result.status?.completed) {
        throw new Error(
          "A geração terminou, mas não retornou uma imagem."
        );
      }

      continue;
    }

    const imageUrl = new URL(`${COMFYUI_URL}/view`);

    imageUrl.searchParams.set("filename", image.filename);
    imageUrl.searchParams.set("subfolder", image.subfolder);
    imageUrl.searchParams.set("type", image.type);

    const imageResponse = await fetch(imageUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });

    if (!imageResponse.ok) {
      throw new Error(
        "Não foi possível recuperar a imagem gerada."
      );
    }

    const imageBytes = await imageResponse.arrayBuffer();

    return Buffer.from(imageBytes);
  }

  throw new Error(
    "A geração demorou mais de 3 minutos."
  );
}
