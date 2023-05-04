import "./styles.css";
import "./balloon.css";
import { Autoformat } from "@ckeditor/ckeditor5-autoformat";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline,
} from "@ckeditor/ckeditor5-basic-styles";
import { Essentials } from "@ckeditor/ckeditor5-essentials";
import { Heading, Title } from "@ckeditor/ckeditor5-heading";
import { AutoLink, Link } from "@ckeditor/ckeditor5-link";
import { DocumentList } from "@ckeditor/ckeditor5-list";
import { Paragraph } from "@ckeditor/ckeditor5-paragraph";
import { Autosave } from "@ckeditor/ckeditor5-autosave";

// @ts-ignore
import CKEditorInspector from "@ckeditor/ckeditor5-inspector";
import { Table, TableToolbar } from "@ckeditor/ckeditor5-table";
import {
  Image,
  ImageCaption,
  ImageToolbar,
  ImageUpload,
  PictureEditing,
} from "@ckeditor/ckeditor5-image";
import { CKBox } from "@ckeditor/ckeditor5-ckbox";
import { CloudServices } from "@ckeditor/ckeditor5-cloud-services";
import { licenseKey, tokenUrl, websocketUrl } from "./token.ts";
import { BalloonEditor } from "@ckeditor/ckeditor5-editor-balloon";
import { BlockToolbar } from "@ckeditor/ckeditor5-ui";
import {
  PresenceList,
  RealTimeCollaborativeComments,
  RealTimeCollaborativeEditing,
} from "@ckeditor/ckeditor5-real-time-collaboration";
import { Comments } from "@ckeditor/ckeditor5-comments";
import {SlashCommand} from "@ckeditor/ckeditor5-slash-command";
import {Mention} from "@ckeditor/ckeditor5-mention";

declare global {
  interface Window {
    editor: BalloonEditor;
  }
}

const editorElement = document.getElementById("editor");

if (!editorElement) {
  throw new Error("No place for the editor!");
}

BalloonEditor.create(editorElement, {
  licenseKey: licenseKey,
  cloudServices: {
    tokenUrl: tokenUrl,
    webSocketUrl: websocketUrl,
  },
  plugins: [
    SlashCommand,
    Mention,
    Comments,
    RealTimeCollaborativeComments,
    RealTimeCollaborativeEditing,
    PresenceList,
    Title,
    CKBox,
    CloudServices,
    PictureEditing,
    ImageUpload,
    Image,
    ImageToolbar,
    ImageCaption,
    Table,
    TableToolbar,
    Autosave,
    Essentials,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Autoformat,
    Paragraph,
    Heading,
    Link,
    AutoLink,
    DocumentList,
    BlockToolbar,
  ],
  blockToolbar: {
    items: [
      "heading",
      "|",
      "undo",
      "redo",
      "|",
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "link",
      "|",
      "numberedList",
      "bulletedList",
      "|",
      "insertTable",
      "|",
      "imageUpload",
      "ckbox",
      "|",
      "comment",
      "commentsArchive"
    ],
  },
  link: {
    defaultProtocol: "https://",
  },
  autosave: {
    waitingTime: 500,
    save: (editor) => {
      return saveData(editor as BalloonEditor);
    },
  },
  table: {
    defaultHeadings: { rows: 1, columns: 1 },
    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
  },
  image: {
    toolbar: ["toggleImageCaption", "imageTextAlternative"],
  },
  title: {
    placeholder: "Title",
  },
  placeholder: "Start writing...",
  collaboration: {
    channelId: "document-id",
  },
  presenceList: {
    container: document.getElementById("presence-list-container")!,
  },
  sidebar: {
    container: document.getElementById("sidebar")!,
  },
}).then((editor) => {
  window.editor = editor;
  const annotationsUIs = editor.plugins.get("AnnotationsUIs");

  annotationsUIs.deactivateAll();

  annotationsUIs.activate(
    "wideSidebar",
    (annotation) => annotation.type === "comment"
  );
  annotationsUIs.activate(
    "inline",
    (annotation) => annotation.type !== "comment"
  );
  CKEditorInspector.attach(editor);
  displayStatus(editor);
});

function saveData(editor: BalloonEditor) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      const version = editor.plugins.get(
        "RealTimeCollaborationClient"
      ).cloudDocumentVersion;

      const commentsRepository = editor.plugins.get("CommentsRepository");
      const commentThreadsData = commentsRepository.getCommentThreads({
        skipNotAttached: true,
        skipEmpty: true,
        toJSON: true,
      });

      console.group();
      console.log("Saved!");
      console.log(editor.data.get());
      console.log(version);
      console.log(commentThreadsData);
      console.groupEnd();
      resolve();
    }, 500);
  });
}

function displayStatus(editor: BalloonEditor) {
  const pendingActions = editor.plugins.get("PendingActions");
  const statusIndicator = document.getElementById("autosave-status");

  pendingActions.on("change:hasAny", (_event, _propertyName, newValue) => {
    if (newValue) {
      statusIndicator?.classList.add("busy");
    } else {
      statusIndicator?.classList.remove("busy");
    }
  });
}

export {};