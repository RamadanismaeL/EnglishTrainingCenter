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
        private static readonly string[] Milhares = [ "", "Mil" ];

        public static string ConverterParaExtenso(int numero)
        {
            if (numero == 0) return "Zero Metical";
            if (numero == 1) return "Um Metical";
            if (numero == 1000) return "Mil Meticais";
            if (numero == 100000) return "Cem Mil Meticais";
            if (numero == 1000000) return "Um Milhão Meticais";

            if (numero > 1000000)
                throw new InvalidOperationException("Atingiu o limite. Por favor, contacte o administrador!");

            var extenso = new StringBuilder();

            if (numero >= 1000)
            {
                int milhar = numero / 1000;
                if (milhar == 1)
                    extenso.Append(Milhares[1]);
                else
                    extenso.Append(ConverterParte(milhar)).Append(" Mil");

                numero %= 1000;
                if (numero > 0)
                    extenso.Append(" e ");
            }

            if (numero > 0)
                extenso.Append(ConverterParte(numero));

            extenso.Append(" Meticais");
            return extenso.ToString();
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