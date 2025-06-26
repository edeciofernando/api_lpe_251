import { Combustiveis, PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'
import { verificaToken } from "../middewares/verificaToken"

const prisma = new PrismaClient()

const router = Router()

const carroSchema = z.object({
  modelo: z.string().min(2,
    { message: "Modelo deve possuir, no mínimo, 2 caracteres" }),
  ano: z.number(),
  preco: z.number(),
  km: z.number(),
  foto: z.string(),
  acessorios: z.string().nullable().optional(),
  combustivel: z.nativeEnum(Combustiveis).optional(),
  destaque: z.boolean().optional(),
  marcaId: z.number(),
  adminId: z.string()
})

router.get("/", async (req, res) => {
  try {
    const carros = await prisma.carro.findMany({
      include: {
        marca: true,
      }
    })
    res.status(200).json(carros)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.get("/destaques", async (req, res) => {
  try {
    const carros = await prisma.carro.findMany({
      orderBy: { id: 'desc' },
      include: {
        marca: true
      },
      where: { destaque: true }
    })
    res.status(200).json(carros)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.post("/", async (req, res) => {

  const valida = carroSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { modelo, ano, preco, km, foto, acessorios = null,
    destaque = true, combustivel = 'FLEX', marcaId, adminId } = valida.data

  try {
    const carro = await prisma.carro.create({
      data: {
        modelo, ano, preco, km, foto, acessorios, destaque,
        combustivel, marcaId, adminId
      }
    })
    res.status(201).json(carro)
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.delete("/:id", verificaToken, async (req, res) => {
  const { id } = req.params

  try {
    const carro = await prisma.carro.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(carro)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.put("/:id", async (req, res) => {
  const { id } = req.params

  const valida = carroSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { modelo, ano, preco, km, foto, acessorios,
    destaque, combustivel, marcaId, adminId } = valida.data

  try {
    const carro = await prisma.carro.update({
      where: { id: Number(id) },
      data: {
        modelo, ano, preco, km, foto, acessorios,
        destaque, combustivel, marcaId, adminId
      }
    })
    res.status(200).json(carro)
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.get("/pesquisa/:termo", async (req, res) => {
  const { termo } = req.params

  // tenta converter para número
  const termoNumero = Number(termo)

  // is Not a Number, ou seja, se não é um número: filtra por texto
  if (isNaN(termoNumero)) {
    try {
      const carros = await prisma.carro.findMany({
        include: {
          marca: true,
        },
        where: {
          OR: [
            // mode: "insensitive" - para pesquisas no PostgreSQL não diferenciarem
            // caracteres maiúsculas de minúsculas (MySQL, não precisa)
            { modelo: { contains: termo, mode: "insensitive" } },
            { marca: { nome: { equals: termo, mode: "insensitive" } } }
          ]
        }
      })
      res.status(200).json(carros)
    } catch (error) {
      res.status(500).json({ erro: error })
    }
  } else {
    // Para números "pequenos", pesquisa por ano
    if (termoNumero <= 3000) {
      try {
        const carros = await prisma.carro.findMany({
          include: {
            marca: true,
          },
          where: { ano: termoNumero }
        })
        res.status(200).json(carros)
      } catch (error) {
        res.status(500).json({ erro: error })
      } 
      // else: para números "maiores", pesquisa por preço 
    } else {
      try {
        const carros = await prisma.carro.findMany({
          include: {
            marca: true,
          },
          where: { preco: { lte: termoNumero } }
        })
        res.status(200).json(carros)
      } catch (error) {
        res.status(500).json({ erro: error })
      }
    }
  }
})

router.get("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const carro = await prisma.carro.findUnique({
      where: { id: Number(id)},
      include: {
        marca: true,
        fotos: true
      }
    })
    res.status(200).json(carro)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.patch("/destacar/:id", verificaToken, async (req, res) => {
  const { id } = req.params

  try {
    const carroDestacar = await prisma.carro.findUnique({
      where: { id: Number(id) },
      select: { destaque: true }, 
    });

    const carro = await prisma.carro.update({
      where: { id: Number(id) },
      data: { destaque: !carroDestacar?.destaque }
    })
    res.status(200).json(carro)
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router
