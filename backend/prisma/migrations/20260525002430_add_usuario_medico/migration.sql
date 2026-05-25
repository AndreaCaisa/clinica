/*
  Warnings:

  - A unique constraint covering the columns `[usuarioId]` on the table `Medico` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Medico" ADD COLUMN     "usuarioId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Medico_usuarioId_key" ON "Medico"("usuarioId");

-- AddForeignKey
ALTER TABLE "Medico" ADD CONSTRAINT "Medico_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "UsuarioSistema"("id") ON DELETE SET NULL ON UPDATE CASCADE;
