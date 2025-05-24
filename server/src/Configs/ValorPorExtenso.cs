/*
*@author Ramadan Ismael
*/

using System.Text;

namespace server.src.Configs
{
    public class ValorPorExtenso
    {
        private static readonly string[] Unidades = [ "", "Um", "Dois", "Três", "Quatro", "Cinco", "Seis", "Sete", "Oito", "Nove" ];
        private static readonly string[] DezADezenove = [ "Dez", "Onze", "Doze", "Treze", "Quatorze", "Quinze", "Dezesseis", "Dezessete", "Dezoito", "Dezenove" ];
        private static readonly string[] Dezenas = [ "", "", "Vinte", "Trinta", "Quarenta", "Cinquenta", "Sessenta", "Setenta", "Oitenta", "Noventa" ];
        private static readonly string[] Centenas = [ "", "Cento", "Duzentos", "Trezentos", "Quatrocentos", "Quinhentos", "Seiscentos", "Setecentos", "Oitocentos", "Novecentos" ];
        //private static readonly string[] Milhares = [ "", "Mil" ];

        public static string ConverterParaExtenso(decimal numero)
        {
            if (numero == 0) return "Zero Metical";
            if (numero > 999999999.99m)
                throw new InvalidOperationException("Atingiu o limite. Por favor, contacte o administrador!");

            int parteInteira = (int)Math.Floor(numero);
            int parteDecimal = (int)Math.Round((numero - parteInteira) * 100);

            var partes = new List<string>();

            int milhoes = parteInteira / 1_000_000;
            int milhares = parteInteira % 1_000_000 / 1_000;
            int centenas = parteInteira % 1_000;

            if (milhoes > 0)
            {
                partes.Add($"{ConverterParte(milhoes)} {(milhoes == 1 ? "Milhão" : "Milhões")}");
            }

            if (milhares > 0)
            {
                if (milhares == 1)
                    partes.Add("Mil");
                else
                    partes.Add($"{ConverterParte(milhares)} Mil");
            }

            if (centenas > 0)
            {
                partes.Add($"{ConverterParte(centenas)}");
            }

            var resultado = new StringBuilder();
            resultado.Append(string.Join(" e ", partes));

            if (parteInteira > 0)
                resultado.Append(parteInteira == 1 ? " Metical" : " Meticais");

            if (parteDecimal > 0)
            {
                if (parteInteira > 0)
                    resultado.Append(" e ");
                resultado.Append(ConverterParte(parteDecimal));
                resultado.Append(parteDecimal == 1 ? " Centavo" : " Centavos");
            }

            return resultado.ToString();
        }

        private static string ConverterParte(int numero)
        {
            var extenso = new StringBuilder();

            if (numero >= 100)
            {
                int centena = numero / 100;

                if (centena == 1 && numero % 100 == 0)
                    extenso.Append("Cem");
                else
                    extenso.Append(Centenas[centena]);

                numero %= 100;

                if (numero > 0)
                    extenso.Append(" e ");
            }

            if (numero >= 10 && numero < 20)
            {
                extenso.Append(DezADezenove[numero - 10]);
            }
            else
            {
                if (numero >= 20)
                {
                    int dezena = numero / 10;
                    extenso.Append(Dezenas[dezena]);
                    numero %= 10;

                    if (numero > 0)
                        extenso.Append(" e ");
                }

                if (numero > 0)
                    extenso.Append(Unidades[numero]);
            }

            return extenso.ToString();
        }
    }
}