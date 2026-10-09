
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { engineeringDocuments } from "./knowledge";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 80,
});

let vectorStorePromise: Promise<MemoryVectorStore> | undefined;

async function getVectorStore(): Promise<MemoryVectorStore> {
  if (!vectorStorePromise) {
    vectorStorePromise = (async () => {
      const chunks = await splitter.splitDocuments(
        engineeringDocuments
      );

      return MemoryVectorStore.fromDocuments(
        chunks,
        embeddings
      );
    })().catch((error) => {
      vectorStorePromise = undefined;
      throw error;
    });
  }

  return vectorStorePromise;
}

export async function searchEngineeringKnowledge(
  query: string
) {
  const vectorStore = await getVectorStore();

  const retriever = vectorStore.asRetriever(3);
  const documents = await retriever.invoke(query);

  return documents.map((document) => ({
    content: document.pageContent,
    title: document.metadata.title,
    source: document.metadata.source,
  }));
}