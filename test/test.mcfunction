# Normal comment
#! Important comment
#> schema: mcfunction

# Commands
say Hello World
execute as @a run give @s diamond 1
function namespace:func

# Selectors
kill @e[type=zombie, limit=1]
tp @s ~ ~1 ~

# Macros
$say $(message)

# NBT
data merge storage ns:storage {Key: "Value", IsTrue: true, Num: 123}

# Coordinates
tp @s 10.5 20 -30
tp @s ~1 ~ ~-1
tp @s ^ ^1 ^5
