-- Inserindo usuários
-- Senha padrão para todos: "123456" (hash bcrypt)
INSERT INTO User (id, name, email, password, role, cnhNumber, cnhExpiry) VALUES
(1, 'Marcelo', 'marcelo@example.com', '$2b$10$R5IJ/Ty5Ourv0bZG4uDcAu/1dlB/rZmWDjRoYqo2jngWIAlf9JUCi', 'admin',    '12345678900', '2028-01-15 00:00:00'),
(2, 'João',    'joao@example.com',    '$2b$10$R5IJ/Ty5Ourv0bZG4uDcAu/1dlB/rZmWDjRoYqo2jngWIAlf9JUCi', 'customer', '98765432100', '2027-06-30 00:00:00'),
(3, 'Maria',   'maria@example.com',   '$2b$10$R5IJ/Ty5Ourv0bZG4uDcAu/1dlB/rZmWDjRoYqo2jngWIAlf9JUCi', 'customer', '45678901234', '2029-03-20 00:00:00')
ON DUPLICATE KEY UPDATE email = email;

-- Inserindo marcas
INSERT INTO Brand (id, name) VALUES
(1, 'Fiat'),
(2, 'Volkswagen'),
(3, 'Chevrolet'),
(4, 'Toyota'),
(5, 'Honda')
ON DUPLICATE KEY UPDATE name = name;

-- Inserindo categorias
INSERT INTO Category (id, name, description) VALUES
(1, 'Econômico',    'Veículos compactos com baixo consumo'),
(2, 'Intermediário','Veículos de médio porte com bom conforto'),
(3, 'SUV',          'Utilitários esportivos com tração e espaço'),
(4, 'Luxo',         'Veículos premium com alto padrão de acabamento'),
(5, 'Utilitário',   'Veículos de carga e trabalho pesado')
ON DUPLICATE KEY UPDATE name = name;

-- Inserindo veículos
INSERT INTO Vehicle (id, model, year, plate, color, dailyRate, description, brandId, categoryId) VALUES
(1, 'Uno',     2020, 'ABC-1234', 'Branco', 80.00,  'Versão básica, ideal para cidade',          1, 1),
(2, 'Gol',     2021, 'DEF-5678', 'Prata',  90.00,  'Clássico popular com boa manutenção',       2, 1),
(3, 'Onix',    2022, 'GHI-9012', 'Preto',  100.00, 'Líder de vendas com câmbio automático',     3, 1),
(4, 'Corolla', 2023, 'JKL-3456', 'Branco', 180.00, 'Sedan confortável e econômico',             4, 2),
(5, 'Civic',   2023, 'MNO-7890', 'Vermelho',160.00,'Esportivo com excelente desempenho',        5, 2),
(6, 'Compass', 2022, 'PQR-1234', 'Cinza',  220.00, 'SUV com tração 4x4 e amplo espaço interno', 1, 3),
(7, 'T-Cross', 2023, 'STU-5678', 'Azul',   230.00, 'SUV compacto com tecnologia avançada',     2, 3),
(8, 'Hilux',   2022, 'VWX-9012', 'Preto',  280.00, 'Caminhonete robusta para trabalho pesado', 4, 5)
ON DUPLICATE KEY UPDATE plate = plate;

-- Inserindo aluguéis de exemplo
INSERT INTO Rental (id, userId, vehicleId, isActive, startDate, totalDays, expectedEndDate, returnedAt, totalAmount, lateFee) VALUES
(1, 2, 1, false, '2026-04-01 08:00:00', 5, '2026-04-06 08:00:00', '2026-04-06 10:00:00', 400.00, NULL),
(2, 3, 4, true,  '2026-05-05 09:00:00', 7, '2026-05-12 09:00:00', NULL, NULL, NULL)
ON DUPLICATE KEY UPDATE id = id;
