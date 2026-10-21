
type RoleplayTextProps = {
  content: string;
};

type RoleplayPart = {
  type: "action" | "dialogue";
  text: string;
};

function formatRoleplay(content: string): RoleplayPart[] {
  const result: RoleplayPart[] = [];

  // Normaliza quebras de linha do Windows e remove
  // espaços desnecessários no começo e no fim.
  const normalized = content
    .replace(/\r\n?/g, "\n")
    .trim();

  if (!normalized) {
    return result;
  }

  // Identifica ações delimitadas por asteriscos.
  // O restante do texto é tratado como diálogo.
  const actionPattern = /\*([^*\n]+)\*/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  function addDialogue(value: string) {
    const cleaned = value
      // Remove travessões isolados que aparecem antes
      // de uma ação ou entre duas ações.
      .replace(/^\s*[—–]\s*(?=$|\n)/gm, "")
      .trim();

    if (!cleaned || /^[—–\s]+$/.test(cleaned)) {
      return;
    }

    // Divide diálogos que já estão separados por
    // linhas em branco.
    const paragraphs = cleaned.split(/\n\s*\n/);

    for (const paragraph of paragraphs) {
      const text = paragraph.trim();

      if (!text || /^[—–\s]+$/.test(text)) {
        continue;
      }

      result.push({
        type: "dialogue",
        text: text.startsWith("—")
          ? text
          : `— ${text}`,
      });
    }
  }

  while ((match = actionPattern.exec(normalized)) !== null) {
    const beforeAction = normalized.slice(
      lastIndex,
      match.index
    );

    addDialogue(beforeAction);

    const action = match[1].trim();

    if (action) {
      result.push({
        type: "action",
        text: action,
      });
    }

    lastIndex = actionPattern.lastIndex;
  }

  addDialogue(normalized.slice(lastIndex));

  return result;
}

export default function RoleplayText({
  content,
}: RoleplayTextProps) {
  const parts = formatRoleplay(content);

  if (parts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 break-words text-sm leading-6">
      {parts.map((part, index) => {
        if (part.type === "action") {
          return (
            <p
              key={index}
              className="whitespace-pre-wrap italic text-gray-300"
            >
              {part.text}
            </p>
          );
        }

        return (
          <p
            key={index}
            className="whitespace-pre-wrap text-gray-100"
          >
            {part.text}
          </p>
        );
      })}
    </div>
  );
}
