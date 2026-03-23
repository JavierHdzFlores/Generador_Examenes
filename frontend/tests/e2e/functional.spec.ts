import { expect, test } from "@playwright/test";
import type { APIRequestContext, Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

type TestUser = {
  id: string;
  name: string;
  email: string;
  password: string;
};

const createTestUser = async (request: APIRequestContext): Promise<TestUser> => {
  const unique = Date.now();
  const payload = {
    name: `Tester ${unique}`,
    email: `tester_${unique}@example.com`,
    password: "123456",
  };

  const registerResponse = await request.post("/api/auth/register", {
    data: payload,
  });

  expect(registerResponse.status()).toBe(201);
  const data = (await registerResponse.json()) as { user: { id: string } };

  return {
    id: data.user.id,
    ...payload,
  };
};

const authenticateSession = async (page: Page, user: TestUser) => {
  const csrfResponse = await page.request.get("/api/auth/csrf");
  expect(csrfResponse.ok()).toBeTruthy();

  const csrfData = (await csrfResponse.json()) as { csrfToken: string };

  const callbackResponse = await page.request.post("/api/auth/callback/credentials", {
    form: {
      csrfToken: csrfData.csrfToken,
      email: user.email,
      password: user.password,
      callbackUrl: "/quiz",
      json: "true",
    },
  });

  expect(callbackResponse.ok()).toBeTruthy();

  const sessionResponse = await page.request.get("/api/auth/session");
  expect(sessionResponse.ok()).toBeTruthy();

  const sessionData = (await sessionResponse.json()) as {
    user?: { email?: string; id?: string };
  };

  expect(sessionData?.user?.email).toBe(user.email);
  expect(sessionData?.user?.id).toBe(user.id);
};

const expectToBeOnQuiz = async (page: Page) => {
  await expect(page.getByRole("heading", { name: "Quiz de Examen" })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page).toHaveURL(/\/quiz/, { timeout: 15_000 });
};

test("login mantiene sesión autenticada y entra a quiz", async ({ page, request }) => {
  const user = await createTestUser(request);
  await authenticateSession(page, user);

  await page.goto("/login");

  await expectToBeOnQuiz(page);
});

test("quiz permite responder una pregunta", async ({ page, request }) => {
  const user = await createTestUser(request);
  const unique = Date.now();
  const questionText = `Pregunta de prueba e2e ${unique}`;
  const correctOption = "HyperText Markup Language";

  const questionResponse = await request.post("/api/questions", {
    data: {
      question: questionText,
      optionA: correctOption,
      optionB: "Home Tool Markup Language",
      optionC: "Hyperlinks and Text Markup Language",
      optionD: "Hyper Tool Multi Language",
      correct: correctOption,
    },
  });

  expect(questionResponse.status()).toBe(201);

  await authenticateSession(page, user);
  await page.goto("/quiz");
  await expectToBeOnQuiz(page);

  await expect(page.getByRole("heading", { name: questionText })).toBeVisible();
  await page.getByRole("button", { name: new RegExp(`A\\.\\s*${correctOption}`) }).click();
  await page.getByRole("button", { name: "Responder" }).click();

  await expect(page.getByText("✅ Correcto")).toBeVisible();
  await expect(page.getByText(`Respuesta correcta: ${correctOption}`)).toBeVisible();
});

test("dashboard muestra historial luego de responder", async ({ page, request }) => {
  const user = await createTestUser(request);
  const unique = Date.now();
  const questionText = `Pregunta dashboard e2e ${unique}`;
  const correctOption = "HTML";

  const questionResponse = await request.post("/api/questions", {
    data: {
      question: questionText,
      optionA: correctOption,
      optionB: "CSS",
      optionC: "JavaScript",
      optionD: "TypeScript",
      correct: correctOption,
    },
  });

  expect(questionResponse.status()).toBe(201);
  const questionData = (await questionResponse.json()) as { id: number };

  const scoreResponse = await request.post("/api/scores", {
    data: {
      userId: user.id,
      questionId: questionData.id,
      points: 1,
    },
  });

  expect(scoreResponse.status()).toBe(201);

  await authenticateSession(page, user);
  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText(questionText)).toBeVisible();
  await expect(page.getByText(`Bienvenido, ${user.name}`)).toBeVisible();
});