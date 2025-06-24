export const formatCpf = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, '')                    // Remove tudo que não for número
    .replace(/^(\d{2})(\d)/g, '($1)$2')   // Coloca o DDD entre parênteses
    .replace(/(\d{5})(\d{4})$/, '$1-$2'); // Coloca o hífen antes dos últimos 4 dígitos
};