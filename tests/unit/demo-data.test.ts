import test from "node:test";
import assert from "node:assert/strict";
import { demoPatients, demoPlans, specialists } from "../../app/lib/demo-db.ts";

test("los personajes de prueba son tres y tienen identificadores únicos", () => {
  assert.equal(demoPatients.length, 3);
  assert.equal(new Set(demoPatients.map((patient) => patient.id)).size, 3);
  for (const patient of demoPatients) {
    assert.ok(patient.name.trim().length > 0);
    assert.ok(patient.label.includes("Perfil paciente"));
  }
});

test("los profesionales ficticios son tres, distintos y con contenido completo", () => {
  assert.equal(specialists.length, 3);
  assert.equal(new Set(specialists.map((professional) => professional.id)).size, 3);
  assert.equal(new Set(specialists.map((professional) => professional.name)).size, 3);
  assert.equal(new Set(specialists.map((professional) => professional.initials)).size, 3);
  assert.deepEqual(
    specialists.map((professional) => professional.category).sort(),
    ["estudiantil", "laboral", "laboral"]
  );
  for (const professional of specialists) {
    assert.ok(professional.approaches.length >= 3);
    assert.ok(professional.bio.trim().length > 40);
    assert.match(professional.experience, /ficticia/i);
    assert.match(professional.education, /simulad/i);
  }
});

test("los planes de demostración conservan las tarifas anunciadas", () => {
  assert.equal(demoPlans.length, 3);
  const byId = Object.fromEntries(demoPlans.map((plan) => [plan.id, plan]));
  assert.equal(byId.individual.price, 95000);
  assert.equal(byId.mensual.price, 279000);
  assert.equal(byId.empresa.price, null);
  for (const plan of demoPlans) {
    assert.ok(plan.name.trim().length > 0);
    assert.ok(plan.billing.trim().length > 0);
  }
});
