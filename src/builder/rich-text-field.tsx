"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Eraser,
  Heading2,
  Heading3,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Underline as UnderlineIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

function ToolbarButton({
  active,
  onClick,
  title,
  children
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(event) => {
        event.preventDefault();
        onClick();
      }}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md text-night-900 hover:bg-mist-100",
        active && "bg-night-950 text-white hover:bg-night-800"
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({
  editor,
  htmlMode,
  onToggleHtml
}: {
  editor: Editor;
  htmlMode: boolean;
  onToggleHtml: () => void;
}) {
  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link-URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-mist-200 p-1.5">
      <ToolbarButton
        title="Fett"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Kursiv"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Unterstrichen"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="h-3.5 w-3.5" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-mist-200" />
      <ToolbarButton
        title="Überschrift 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        <Heading2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Überschrift 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
      >
        <Heading3 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-mist-200" />
      <ToolbarButton
        title="Linksbündig"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Zentriert"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Rechtsbündig"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Blocksatz"
        active={editor.isActive({ textAlign: "justify" })}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <AlignJustify className="h-3.5 w-3.5" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-mist-200" />
      <ToolbarButton
        title="Aufzählung"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Nummerierte Liste"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Link einfügen"
        active={editor.isActive("link")}
        onClick={setLink}
      >
        <Link2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Link entfernen"
        onClick={() => editor.chain().focus().unsetLink().run()}
      >
        <Link2Off className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Formatierung löschen"
        onClick={() =>
          editor.chain().focus().clearNodes().unsetAllMarks().run()
        }
      >
        <Eraser className="h-3.5 w-3.5" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-mist-200" />
      <ToolbarButton
        title="HTML-Quelltext bearbeiten"
        active={htmlMode}
        onClick={onToggleHtml}
      >
        <Code className="h-3.5 w-3.5" />
      </ToolbarButton>
    </div>
  );
}

// Rich-Text-Feld für den Page-Builder (Puck Custom Field) mit HTML-Modus.
export function RichTextField({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [htmlMode, setHtmlMode] = useState(false);
  const [htmlDraft, setHtmlDraft] = useState(value ?? "");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // Link und Underline sind im StarterKit v3 bereits enthalten
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false }
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] })
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "rt-content min-h-28 px-3 py-2 text-sm leading-relaxed outline-none"
      }
    }
  });

  // Externen Wert übernehmen (z.B. nach Zurücksetzen)
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused && !htmlMode) {
      editor.commands.setContent(value || "<p></p>");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  const toggleHtml = () => {
    if (!editor) return;
    if (htmlMode) {
      // HTML übernehmen und zurück zur visuellen Bearbeitung
      editor.commands.setContent(htmlDraft || "<p></p>");
      onChange(htmlDraft);
      setHtmlMode(false);
    } else {
      setHtmlDraft(editor.getHTML());
      setHtmlMode(true);
    }
  };

  if (!editor) {
    return <div className="h-28 rounded-lg border border-mist-200 bg-white" />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-mist-300 bg-white">
      <Toolbar editor={editor} htmlMode={htmlMode} onToggleHtml={toggleHtml} />
      {htmlMode ? (
        <textarea
          value={htmlDraft}
          onChange={(event) => {
            setHtmlDraft(event.target.value);
            onChange(event.target.value);
          }}
          spellCheck={false}
          className="min-h-40 w-full resize-y bg-night-950 px-3 py-2 font-mono text-xs leading-relaxed text-mint-300 outline-none"
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}
