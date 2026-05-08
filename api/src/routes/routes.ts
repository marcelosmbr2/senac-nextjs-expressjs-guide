import { Router } from 'express'
import { login } from '../controllers/auth.controller'
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/user.controller'
import { getBrands, createBrand, updateBrand, deleteBrand } from '../controllers/brand.controller'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller'
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicle.controller'
import { getRentals, createRental, updateRental, returnVehicle, deleteRental } from '../controllers/rental.controller'
import { authMiddleware } from '../middlewares/auth'
import { adminMiddleware } from '../middlewares/admin'
import { customerMiddleware } from '../middlewares/customer'

const router = Router()

// Autenticação (público)
router.post('/login', login)

// Usuários (admin)
router.get('/users', authMiddleware, adminMiddleware, getUsers)
router.get('/users/:id', authMiddleware, adminMiddleware, getUserById)
router.post('/users', authMiddleware, adminMiddleware, createUser)
router.put('/users/:id', authMiddleware, adminMiddleware, updateUser)
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser)

// Marcas (GET: auth; CUD: admin)
router.get('/brands', authMiddleware, getBrands)
router.post('/brands', authMiddleware, adminMiddleware, createBrand)
router.put('/brands/:id', authMiddleware, adminMiddleware, updateBrand)
router.delete('/brands/:id', authMiddleware, adminMiddleware, deleteBrand)

// Categorias (GET: auth; CUD: admin)
router.get('/categories', authMiddleware, getCategories)
router.post('/categories', authMiddleware, adminMiddleware, createCategory)
router.put('/categories/:id', authMiddleware, adminMiddleware, updateCategory)
router.delete('/categories/:id', authMiddleware, adminMiddleware, deleteCategory)

// Veículos (GET: auth; CUD: admin)
router.get('/vehicles', authMiddleware, getVehicles)
router.post('/vehicles', authMiddleware, adminMiddleware, createVehicle)
router.put('/vehicles/:id', authMiddleware, adminMiddleware, updateVehicle)
router.delete('/vehicles/:id', authMiddleware, adminMiddleware, deleteVehicle)

// Locações
router.post('/rentals', authMiddleware, customerMiddleware, createRental)
router.get('/rentals', authMiddleware, adminMiddleware, getRentals)
router.put('/rentals/:id', authMiddleware, adminMiddleware, updateRental)
router.post('/rentals/:id/return', authMiddleware, adminMiddleware, returnVehicle)
router.delete('/rentals/:id', authMiddleware, adminMiddleware, deleteRental)

export default router
