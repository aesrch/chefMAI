-- Seed data: common ingredient substitutions
-- Categories: dairy, protein, grain, fat, sweetener, egg, spice, sauce, produce

INSERT INTO ingredient_substitutions (sub_id, original_name, substitute_name, ratio, notes, category, confidence) VALUES
-- Dairy substitutions
('sub-001', 'buttermilk', 'milk + lemon juice', '1 cup + 1 tbsp', 'Let sit 5 minutes to curdle', 'dairy', 0.90),
('sub-002', 'heavy cream', 'coconut cream', '1:1', 'Best for curries and soups', 'dairy', 0.85),
('sub-003', 'heavy cream', 'butter + milk', '1/3 cup + 3/4 cup', 'For sauces, not whipping', 'dairy', 0.80),
('sub-004', 'sour cream', 'greek yogurt', '1:1', 'Similar tang and texture', 'dairy', 0.92),
('sub-005', 'cream cheese', 'greek yogurt', '1:1', 'Drain yogurt for thickness', 'dairy', 0.75),
('sub-006', 'whole milk', 'oat milk', '1:1', 'Closest non-dairy match', 'dairy', 0.82),
('sub-007', 'parmesan', 'pecorino romano', '1:1', 'Slightly saltier, adjust salt', 'dairy', 0.88),
('sub-008', 'ricotta', 'cottage cheese', '1:1', 'Blend smooth if needed', 'dairy', 0.80),
('sub-009', 'mozzarella', 'provolone', '1:1', 'Less stretchy, more flavor', 'dairy', 0.78),
('sub-010', 'butter', 'olive oil', '3/4 amount', 'For cooking, not baking', 'fat', 0.85),

-- Protein substitutions
('sub-011', 'chicken breast', 'turkey breast', '1:1', 'Very similar taste and texture', 'protein', 0.92),
('sub-012', 'chicken breast', 'tofu', '1:1 by weight', 'Press and marinate for best results', 'protein', 0.75),
('sub-013', 'ground beef', 'ground turkey', '1:1', 'Leaner, add oil if dry', 'protein', 0.88),
('sub-014', 'ground beef', 'lentils', '1 cup cooked per 1/2 lb', 'Great for tacos and bolognese', 'protein', 0.72),
('sub-015', 'bacon', 'turkey bacon', '1:1', 'Lower fat, similar smoke', 'protein', 0.78),
('sub-016', 'shrimp', 'chicken', '1:1 by weight', 'Adjust cook time', 'protein', 0.70),
('sub-017', 'fish sauce', 'soy sauce', '1:1', 'Less funky, add a pinch of sugar', 'sauce', 0.80),
('sub-018', 'skirt steak', 'flank steak', '1:1', 'Slice against the grain', 'protein', 0.90),
('sub-019', 'skirt steak', 'chicken thighs', '1:1 by weight', 'Different flavor, similar texture', 'protein', 0.72),

-- Grain/flour substitutions
('sub-020', 'breadcrumbs', 'crushed crackers', '1:1', 'Saltines or Ritz work well', 'grain', 0.82),
('sub-021', 'breadcrumbs', 'toasted bread blended', '1:1', 'Pulse in food processor', 'grain', 0.90),
('sub-022', 'all-purpose flour', 'whole wheat flour', '1:1', 'Denser result, nuttier flavor', 'grain', 0.78),
('sub-023', 'cake flour', 'all-purpose flour - cornstarch', '1 cup - 2 tbsp + 2 tbsp cornstarch', 'Sift together twice', 'grain', 0.88),
('sub-024', 'pasta', 'zucchini noodles', '2 zucchini per 200g pasta', 'Spiralize, do not overcook', 'grain', 0.65),
('sub-025', 'rice', 'cauliflower rice', '1:1 by volume', 'Sauté briefly, releases water', 'grain', 0.68),
('sub-026', 'corn tortillas', 'flour tortillas', '1:1', 'Different texture, similar use', 'grain', 0.85),
('sub-027', 'quinoa', 'couscous', '1:1', 'Similar cook time', 'grain', 0.80),
('sub-028', 'rigatoni', 'penne', '1:1', 'Similar shape and sauce-holding', 'grain', 0.95),
('sub-029', 'rigatoni', 'fusilli', '1:1', 'Good sauce clinging', 'grain', 0.90),

-- Egg substitutions
('sub-030', 'egg', 'flax egg', '1 tbsp ground flax + 3 tbsp water per egg', 'Let sit 5 min to gel', 'egg', 0.75),
('sub-031', 'egg', 'aquafaba', '3 tbsp per egg', 'Chickpea liquid, great for meringue', 'egg', 0.78),
('sub-032', 'egg', 'mashed banana', '1/4 cup per egg', 'Best for baking, adds sweetness', 'egg', 0.70),
('sub-033', 'egg', 'applesauce', '1/4 cup per egg', 'Best for moist baked goods', 'egg', 0.68),

-- Sweetener substitutions
('sub-034', 'white sugar', 'brown sugar', '1:1', 'Adds molasses flavor and moisture', 'sweetener', 0.88),
('sub-035', 'white sugar', 'honey', '3/4 cup per 1 cup', 'Reduce other liquids by 1/4 cup', 'sweetener', 0.78),
('sub-036', 'brown sugar', 'white sugar + molasses', '1 cup + 1 tbsp', 'Mix thoroughly', 'sweetener', 0.92),
('sub-037', 'palm sugar', 'brown sugar', '1:1', 'Similar caramel notes', 'sweetener', 0.85),
('sub-038', 'caster sugar', 'white sugar blended', '1:1', 'Pulse in blender 30 seconds', 'sweetener', 0.95),

-- Spice/herb substitutions
('sub-039', 'fresh basil', 'dried basil', '1 tsp dried per 1 tbsp fresh', 'Add earlier in cooking', 'spice', 0.72),
('sub-040', 'thai basil', 'regular basil', '1:1', 'Less anise flavor, still works', 'spice', 0.75),
('sub-041', 'cilantro', 'flat-leaf parsley', '1:1', 'Different flavor, similar look', 'spice', 0.65),
('sub-042', 'kaffir lime leaves', 'lime zest', '1.5 tsp zest per 2 leaves', 'Less complex but similar citrus', 'spice', 0.70),

-- Fat/oil substitutions
('sub-043', 'olive oil', 'avocado oil', '1:1', 'Higher smoke point', 'fat', 0.90),
('sub-044', 'olive oil', 'coconut oil', '1:1', 'Adds slight coconut flavor', 'fat', 0.75),
('sub-045', 'vegetable oil', 'sunflower oil', '1:1', 'Neutral flavor, direct swap', 'fat', 0.95),
('sub-046', 'unsalted butter', 'salted butter', '1:1', 'Reduce added salt by 1/4 tsp per stick', 'fat', 0.92),

-- Sauce/condiment substitutions
('sub-047', 'soy sauce', 'tamari', '1:1', 'Gluten-free option', 'sauce', 0.92),
('sub-048', 'coconut milk', 'heavy cream', '1:1', 'For non-vegan version', 'dairy', 0.80),
('sub-049', 'green curry paste', 'red curry paste', '1:1', 'Different heat profile', 'sauce', 0.72),
('sub-050', 'white miso paste', 'tahini', '1:1', 'Less umami, more nutty', 'sauce', 0.60),

-- Produce substitutions
('sub-051', 'lemon juice', 'lime juice', '1:1', 'Similar acidity', 'produce', 0.90),
('sub-052', 'sweet potato', 'butternut squash', '1:1', 'Similar sweetness and texture', 'produce', 0.82),
('sub-053', 'red onion', 'white onion', '1:1', 'Milder flavor', 'produce', 0.85),
('sub-054', 'avocado', 'hummus', '1:1 by volume', 'Different flavor, similar creaminess', 'produce', 0.60),
('sub-055', 'tomatillos', 'green tomatoes', '1:1', 'Less tangy, add lime juice', 'produce', 0.70);
