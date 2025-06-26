import { Combustiveis, PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { v2 as cloudinary } from 'cloudinary'

// Configuration
cloudinary.config({ 
  cloud_name: 'dvfcxadyh', 
  api_key: '626956919255949', 
  api_secret: '_7K5oKKtDfTGhTixH8IMVB1LPoI' // Click 'View API Keys' above to copy your API secret
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'revenda_manha',
      allowed_formats: ['jpg', 'jpeg', 'png'],
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    }  
  },
})

const upload = multer({ storage })

const prisma = new PrismaClient()

const router = Router()

const fotoSchema = z.object({
  descricao: z.string().min(5,
    { message: "Descrição da Foto deve possuir, no mínimo, 5 caracteres" }),
  carroId: z.coerce.number(),
})

router.get("/", async (req, res) => {
  try {
    const fotos = await prisma.foto.findMany({
      include: {
        carro: true,
      }
    })
    res.status(200).json(fotos)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", upload.single('imagem'), async (req, res) => {

  const valida = fotoSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  if (!req.file || !req.file.path) {
    res.status(400).json(
      {erro: "Envio da imagem é obrigatório"})
    return
  }

  const { descricao, carroId } = valida.data
  const urlFoto = req.file.path

  try {
    const foto = await prisma.foto.create({
      data: { descricao, carroId, url: urlFoto }
    })
    res.status(201).json(foto)
  } catch (error) {
    res.status(400).json({ error })
  }
})

/*
router.delete("/:id", async (req, res) => {
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
    destaque, combustivel, marcaId } = valida.data

  try {
    const carro = await prisma.carro.update({
      where: { id: Number(id) },
      data: {
        modelo, ano, preco, km, foto, acessorios,
        destaque, combustivel, marcaId
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
        marca: true
      }
    })
    res.status(200).json(carro)
  } catch (error) {
    res.status(400).json(error)
  }
})
*/

export default router
