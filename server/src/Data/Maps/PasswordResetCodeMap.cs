/*
*@author Ramadan Ismael
*/

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using server.src.Models;

namespace server.src.Data.Maps
{
    public class PasswordResetCodeMap : IEntityTypeConfiguration<PasswordResetCodeModel>
    {
        public void Configure(EntityTypeBuilder<PasswordResetCodeModel> builder)
        {
            builder.ToTable("tbPasswordResetCode");

            builder.Property(u => u.Id)
                .HasColumnName("Id")
                .HasColumnType("bigint unsigned")
                .ValueGeneratedOnAdd()
                .IsRequired();
            builder.HasKey(u => u.Id);

            builder.Property(u => u.UserId)
                .HasColumnName("UserId")
                .HasColumnType("varchar(500)")
                .IsRequired();

            builder.Property(u => u.Code)
                .HasColumnName("Code")
                .HasColumnType("varchar(6)")
                .IsRequired();

            builder.Property<DateTime?>(u => u.ExpiresAt)
                .HasColumnName("ExpiresAt")
                .HasColumnType("datetime");
        }
    }
}