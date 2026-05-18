export function PhenotypeCard() {

  const phenotype =
    "Type A - Classic Hyperandrogenic PCOS"

  const subtype =
    "Insulin Resistant Phenotype"

  const characteristics = [
    "Elevated AMH",
    "Irregular ovulation",
    "Insulin resistance",
    "Inflammatory profile"
  ]

  return (

    <div className="bg-zinc-900 border border-purple-500/20 rounded-2xl p-6 mt-6">

      <h2 className="text-2xl font-bold text-white mb-4">
        Phenotype Classification
      </h2>

      <div className="space-y-4">

        <div>
          <p className="text-zinc-400 text-sm">
            Phenotype
          </p>

          <p className="text-xl text-purple-300 font-semibold">
            {phenotype}
          </p>
        </div>

        <div>
          <p className="text-zinc-400 text-sm">
            Subtype
          </p>

          <p className="text-teal-300 font-medium">
            {subtype}
          </p>
        </div>

        <div>
          <p className="text-zinc-400 text-sm mb-2">
            Characteristics
          </p>

          <ul className="space-y-2">

            {characteristics.map((item, index) => (

              <li
                key={index}
                className="text-zinc-200 flex items-center gap-2"
              >
                <span className="text-purple-400">•</span>

                {item}

              </li>

            ))}

          </ul>
        </div>

      </div>

    </div>
  )
}